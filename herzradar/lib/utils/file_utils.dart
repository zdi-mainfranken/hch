import 'package:path_provider/path_provider.dart';

class FileUtils {
  static Future<String> getAppDirectory() async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  static String generateFileName(String prefix) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${prefix}_$timestamp.mp4';
  }
}
