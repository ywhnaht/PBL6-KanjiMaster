import requests
import json


BACKEND_URL = "http://localhost:8080/api/gemini/translate/"


def test_gemini_translate():
    payload = {
        "text": "日本語の勉強は楽しいです"
    }

    try:
        res = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=20
        )

        print("\n========== STATUS ==========")
        print(res.status_code)

        print("\n========== RAW TEXT ==========")
        print(res.text)

        assert res.status_code == 200, f"HTTP {res.status_code}"

        data = res.json()

        assert "japanese" in data
        assert "vietnamese" in data
        assert data["japanese"]
        assert data["vietnamese"]

        print("\n✅ TEST PASSED")
        print("JP:", data["japanese"])
        print("VI:", data["vietnamese"])

    except Exception as e:
        print("\n❌ TEST FAILED")
        print(str(e))


if __name__ == "__main__":
    test_gemini_translate()
