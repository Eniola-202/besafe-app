import { InferenceSession } from "onnxruntime-react-native";

// load a model
const session: InferenceSession = await InferenceSession.create('./assets/SafeHer_ThreatModel.onnx');
// input as InferenceSession.OnnxValueMapType
const result = session.run(input, ['num_detection:0', 'detection_classes:0']);