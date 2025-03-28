import 'package:flutter/material.dart';

class FacePositioningOverlay extends StatelessWidget {
  final bool isAligned;
  final double overlayWidth;
  final double overlayHeight;

  const FacePositioningOverlay({
    Key? key,
    this.isAligned = false,
    this.overlayWidth = 180, // Reduced from 200
    this.overlayHeight = 220, // Reduced from 250
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Transparent face cutout in the middle
        Center(
          child: Container(
            width: overlayWidth,
            height: overlayHeight,
            decoration: BoxDecoration(
              border: Border.all(
                color: isAligned ? Colors.green : Colors.white,
                width: 2.0,
              ),
              borderRadius: BorderRadius.circular(100),
              color: Colors.transparent,
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // The cutout part
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100),
                    color: Colors.transparent,
                  ),
                ),

                // Face silhouette
                Opacity(
                  opacity: 0.2,
                  child: Image.asset(
                    'assets/images/face_silhouette.png',
                    width: overlayWidth - 20,
                    height: overlayHeight - 20,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      // Fallback if image asset not found
                      return Icon(
                        Icons.face,
                        size: 80, // Reduced from 100
                        color: Colors.white.withOpacity(0.3),
                      );
                    },
                  ),
                ),

                if (!isAligned)
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Positionieren Sie Ihr Gesicht hier',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12, // Smaller text
                          shadows: [
                            Shadow(
                              offset: Offset(1, 1),
                              blurRadius: 3.0,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
