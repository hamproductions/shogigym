require 'open3'
revision = '6af8674c32d80af755d9aeffd0621d3b9f615b5e'
source = Gem.loaded_specs.fetch('bioshogi').full_gem_path
head, status = Open3.capture2('git', '-C', source, 'rev-parse', 'HEAD')
abort 'Bioshogi checkout revision does not match the pinned source' unless status.success? && head.strip == revision
abort 'Bioshogi source contains local modifications' unless system('git', '-C', source, 'diff', '--quiet', 'HEAD', '--', 'lib')
require 'bioshogi'
require 'json'
require 'zlib'
require 'stringio'
module OracleSnapshot
  attr_reader :oracle_before_finalize
  def after_execute_all
    @oracle_before_finalize = { sfen: to_short_sfen.delete_prefix('position sfen '), tags: players.map { |player| player.tag_bundle.to_h } }
    super
  end
end
Bioshogi::Container::Basic.prepend(OracleSnapshot)
root = File.expand_path('../..', __dir__)
files = Dir[File.join(root, 'vendor/bioshogi/fixtures/*.kif')].sort
def snapshot(container)
  { sfen: container.to_short_sfen.delete_prefix('position sfen '), tags: container.players.map { |player| player.tag_bundle.to_h } }
end

def mirror_sfen(sfen)
  board, turn, hands = sfen.split
  rows = board.split('/').reverse.map do |row|
    cells = row.scan(/\+?[a-zA-Z]|[1-9]/).flat_map { |cell| cell.match?(/^[1-9]$/) ? Array.new(cell.to_i, nil) : [cell] }.reverse
    cells.chunk { |cell| cell.nil? }.map { |empty, group| empty ? group.length.to_s : group.map(&:swapcase).join }.join
  end
  "#{rows.join('/')} #{turn == 'b' ? 'w' : 'b'} #{hands.swapcase} 1"
end

def mirror_move(move)
  move.gsub(/([1-9])([a-i])/) { "#{10 - $1.to_i}#{('a'.ord + 'i'.ord - $2.ord).chr}" }
end

def record_of(parser, states, file)
  initial = parser.formatter.initial_container.players.map { |player| player.tag_bundle.to_h }
  container = parser.container
  states << container.oracle_before_finalize
  events = container.hand_logs.each_with_index.map do |hand, index|
    { ply: index + 1, color: hand.soldier.location.key, tags: hand.tag_bundle.to_h, sfen: states[index + 1][:sfen], accumulated: states[index + 1][:tags], move: hand.to_sfen, origin: hand.move_hand&.origin_soldier&.to_csa, moved: hand.soldier.to_csa, captured: hand.move_hand&.captured_soldier&.to_csa }
  end
  { file: file, preset: parser.formatter.preset_info_or_nil&.key, initial: initial, initialSfen: states[0][:sfen], events: events, final: container.players.map { |player| player.tag_bundle.to_h }, plies: container.hand_logs.length }
end

mirrored_records = []
records = files.map do |file|
  begin
    states = []
    parser = Bioshogi::Parser.file_parse(file, ki2_function: false, callback: ->(container) { states << snapshot(container) })
    original = record_of(parser, states, File.basename(file))
    mirrored_states = []
    input = "position sfen #{mirror_sfen(original[:initialSfen])} moves #{original[:events].map { |event| mirror_move(event[:move]) }.join(' ')}"
    mirrored = Bioshogi::Parser.parse(input, ki2_function: false, callback: ->(container) { mirrored_states << snapshot(container) })
    mirrored.pi.force_preset_info = parser.formatter.preset_info_or_nil
    mirrored.pi.last_action_info1 = parser.pi.input_last_action_info
    if winner = parser.pi.header.win_side_location
      mirrored.pi.header['勝者'] = winner.key == :black ? :white : :black
    end
    mirrored_records << record_of(mirrored, mirrored_states, File.basename(file))
    original
  rescue => error
    { file: File.basename(file), error: error.class.name, message: error.message }
  end
end

output = {
  source: 'https://github.com/akicho8/bioshogi',
  revision: revision,
  ruby: RUBY_VERSION,
  analysisVersion: Bioshogi::ANALYSIS_VERSION,
  options: { ki2_function: false, validate_feature: true, analysis_feature: true },
  records: records,
  mirroredRecords: mirrored_records,
}
stream = StringIO.new
writer = Zlib::GzipWriter.new(stream, Zlib::BEST_COMPRESSION)
writer.mtime = 0
writer.write(JSON.generate(output))
writer.close
File.binwrite(File.join(root, 'vendor/bioshogi/oracle.json.gz'), stream.string)
puts JSON.generate({ records: records.length, mirroredRecords: mirrored_records.length, errors: records.filter_map { |record| record if record[:error] } })
exit 1 if records.any? { |record| record[:error] }
