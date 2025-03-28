import 'dart:io';
import 'package:path_provider/path_provider.dart';

class StorageService {
  Future<String> getLocalPath() async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File> saveRecording(File recordingFile, String filename) async {
    final path = await getLocalPath();
    final File localFile = File('$path/$filename');
    return recordingFile.copy(localFile.path);
  }
// Additional methods for metadata management can be added here.
}
