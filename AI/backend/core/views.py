from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import strokes_to_image, segment_characters_from_image, preprocess_canvas_image, recognize_char,suggest_compounds,filter_valid_words
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.decorators import api_view, parser_classes
from googletrans import Translator
from django.shortcuts import render

@api_view(['POST'])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def recognize_strokes(request):
    """
    POST JSON:
    {
        "strokes": [
            [[x1,y1],[x2,y2],...],  # stroke 1
            [[x1,y1],[x2,y2],...]   # stroke 2
        ]
    }
    """
    try:
        strokes = request.data.get('strokes', [])
        if not strokes:
            return Response({"error": "No strokes provided"}, status=400)

        img = strokes_to_image(strokes)
        img.save("debug.png")  # Lưu file debug.png trong thư mục project
        chars = segment_characters_from_image(img, k=5)  # [(box, predictions)]

        results = []
        for box, preds in chars:
            results.append({
                "box": {"x": box[0], "y": box[1], "w": box[2], "h": box[3]},
                "top5": [{"label": l, "prob": p} for l, p in preds]
            })

        return Response({"num_chars": len(results), "predictions": results})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def kanji_compounds(request):
    try:
        word=request.data.get('word', '')
        if not word:
            return Response({"error":"No word provided"}, status=400)
        top_compounds = suggest_compounds(word, top_n=10, min_freq=2)
        valid_compounds = filter_valid_words(top_compounds)
        translator = Translator()
        word_array = {}
        for word in valid_compounds:
            vietnamese = translator.translate(word, src='ja', dest='vi').text
            word_array[word]= vietnamese
        return Response(word_array)
        
              
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def draw_view(request):
    return render(request, 'draw.html')