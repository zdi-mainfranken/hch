import 'dart:html' as html;

class HtmlCameraAdapter {
  static Future<html.MediaStream?> getCamera({bool front = true}) async {
    try {
      final facing = front ? 'user' : 'environment';
      return await html.window.navigator.mediaDevices?.getUserMedia({
        'video': {
          'facingMode': facing,
          'width': {'ideal': 1280},
          'height': {'ideal': 720}
        }
      });
    } catch (e) {
      print("Error accessing camera via adapter: $e");
      return null;
    }
  }
}
