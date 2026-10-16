import { FileUpload, useFileUpload } from '@ark-ui/react/file-upload'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui'

type FilePickerProps = { accept: string; disabled?: boolean; size?: 'sm' | 'md'; onFile: (file: File) => void; children: ReactNode }

export function FilePicker({ accept, disabled, size = 'md', onFile, children }: FilePickerProps) {
  const upload = useFileUpload({
    accept,
    disabled,
    maxFiles: 1,
    allowDrop: false,
    onFileAccept: ({ files }) => {
      upload.clearFiles()
      if (files[0]) onFile(files[0])
    },
  })
  return (
    <FileUpload.RootProvider value={upload}>
      <FileUpload.Trigger asChild>
        <Button variant="subtle" size={size}>
          {children}
        </Button>
      </FileUpload.Trigger>
      <FileUpload.HiddenInput />
    </FileUpload.RootProvider>
  )
}
