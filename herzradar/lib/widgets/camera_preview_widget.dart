// lib/widgets/camera_preview_widget.dart
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

import '../services/camera_service.dart';

class CameraPreviewWidget extends StatefulWidget {
  final CameraService cameraService;

  const CameraPreviewWidget({Key? key, required this.cameraService})
      : super(key: key);

  @override
  _CameraPreviewWidgetState createState() => _CameraPreviewWidgetState();
}

class _CameraPreviewWidgetState extends State<CameraPreviewWidget> {
  @override
  Widget build(BuildContext context) {
    if (widget.cameraService.controller == null ||
        !widget.cameraService.controller!.value.isInitialized) {
      return Center(child: Text('Initializing camera...'));
    }

    // Get the screen dimensions
    final size = MediaQuery.of(context).size;
    final deviceRatio = size.width / size.height;
    final cameraRatio = widget.cameraService.controller!.value.aspectRatio;

    // Calculate dimensions to show the complete camera feed
    double previewWidth;
    double previewHeight;

    if (deviceRatio > cameraRatio) {
      // Device is wider than the camera feed, so fit to height
      previewHeight = size.height;
      previewWidth = previewHeight * cameraRatio;
    } else {
      // Device is taller than the camera feed, so fit to width
      previewWidth = size.width;
      previewHeight = previewWidth / cameraRatio;
    }

    return Container(
      width: size.width,
      height: size.height,
      color: Colors.black,
      child: Center(
        child: SizedBox(
          width: previewWidth,
          height: previewHeight,
          child: CameraPreview(widget.cameraService.controller!),
        ),
      ),
    );
  }
}
