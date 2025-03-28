import 'package:flutter/material.dart';

import '../constants.dart';

class LargeButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final double? width;

  const LargeButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.width,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      constraints: BoxConstraints(
        maxWidth: width ?? double.infinity,
        minWidth: 120.0,
      ),
      height: Dimensions.buttonHeight,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          textStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          disabledBackgroundColor: Colors.grey,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        onPressed: onPressed,
        child: Text(
          text,
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }
}
