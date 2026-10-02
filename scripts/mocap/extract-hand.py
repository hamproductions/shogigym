import json, os, sys
PAD = float(os.environ.get('PAD', '0'))
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

opts = vision.HandLandmarkerOptions(base_options=mpp.BaseOptions(model_asset_path='hand_landmarker.task'), running_mode=vision.RunningMode.VIDEO, num_hands=1, min_hand_detection_confidence=0.15, min_hand_presence_confidence=0.15, min_tracking_confidence=0.15)
out = {}
for vid in sys.argv[1:]:
    det = vision.HandLandmarker.create_from_options(opts)
    cap = cv2.VideoCapture(vid)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = []
    i = 0
    while True:
        ok, frame = cap.read()
        if not ok: break
        pad = int(frame.shape[1] * PAD)
        framep = cv2.copyMakeBorder(frame, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(200, 200, 200))
        img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(framep, cv2.COLOR_BGR2RGB))
        r = det.detect_for_video(img, int(i * 1000 / fps))
        if r.hand_world_landmarks:
            frames.append({'t': round(i / fps, 3), 'hand': r.handedness[0][0].category_name, 'world': [[round(p.x, 5), round(p.y, 5), round(p.z, 5)] for p in r.hand_world_landmarks[0]], 'image': [[round(p.x, 4), round(p.y, 4)] for p in r.hand_landmarks[0]]})
        i += 1
    out[vid] = {'fps': fps, 'frames': frames, 'total': i}
    print(vid, 'frames', i, 'detected', len(frames))
json.dump(out, open(os.environ.get('OUT', 'landmarks.json'), 'w'))
