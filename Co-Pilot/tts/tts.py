import torch
from TTS.api import TTS

class TTSGenerator:
    """A class to handle text-to-speech generation."""
    
    def __init__(self, model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=True):
        """Initialize the TTS Generator."""
        # Get device
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name
        self.progress_bar = progress_bar
        
        # Initialize TTS model
        self.tts = TTS(model_name=model_name, progress_bar=progress_bar)
    
    def generate_speech(self, text, output_file, reference_audio, language="en"):
        """Generate speech from text."""
        # Generate speech
        self.tts.tts_to_file(
            text=text, 
            file_path=output_file, 
            speaker_wav=reference_audio,
            language=language
        )
        
        return output_file

# Module-level generator instance (initialized on first use)
_generator = None
_current_model_name = None
_current_progress_bar = None

def get_generator(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=True):
    """Get or initialize the TTS generator."""
    global _generator, _current_model_name, _current_progress_bar
    
    # Reinitialize if model or settings changed
    if (_generator is None or 
        _current_model_name != model_name or 
        _current_progress_bar != progress_bar):
        
        _generator = TTSGenerator(model_name=model_name, progress_bar=progress_bar)
        _current_model_name = model_name
        _current_progress_bar = progress_bar
        
    return _generator

def generate_speech(text, output_file, reference_audio, language="en", 
                   model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=True):
    """Generate speech from text."""
    generator = get_generator(model_name=model_name, progress_bar=progress_bar)
    return generator.generate_speech(text, output_file, reference_audio, language)

# Example usage when script is run directly
if __name__ == "__main__":
    reference_audio = "./Germany_second.wav"
    text = "Überprüfen Sie ob alle in der Lieferungen enthaltenen Komponenten vorhanden sind."
    output_file = "../output.wav"
    
    generated_file = generate_speech(
        text=text,
        output_file=output_file,
        reference_audio=reference_audio,
        language="de"
    )
    
    print(f"Speech generated and saved to {generated_file}")