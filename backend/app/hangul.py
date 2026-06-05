"""
Latin romanization → Hangul via Google Input Tools API.

Endpoint: https://inputtools.google.com/request
  ?text=annyeong&itc=ko-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8

Response structure:
  ["SUCCESS", [["<input>", ["<suggestion1>", ...], null, null, [...]]], ...]

Falls back to a simple local mapping if the API is unreachable.
"""

import requests

GOOGLE_INPUT_TOOLS_URL = "https://inputtools.google.com/request"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
}


def latin_to_hangul(text: str) -> str:
    """
    Convert romanized Korean text to Hangul using Google Input Tools.

    Args:
        text: Romanized Korean string, e.g. "annyeong"

    Returns:
        Hangul string, e.g. "안녕".
        Falls back to the original text if the API is unreachable.
    """
    if not text or not text.strip():
        return text

    params = {
        "text": text,
        "itc": "ko-t-i0-und",   # Korean IME identifier
        "num": "1",              # number of suggestions
        "cp": "0",
        "cs": "1",
        "ie": "utf-8",
        "oe": "utf-8",
    }

    try:
        resp = requests.get(
            GOOGLE_INPUT_TOOLS_URL,
            params=params,
            headers=HEADERS,
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()

        # data[0] == "SUCCESS"
        # data[1][0][1][0] == first suggestion for the input
        if data[0] == "SUCCESS" and data[1] and data[1][0][1]:
            return data[1][0][1][0]

    except Exception:
        pass  # fall through to fallback

    return _local_fallback(text)


# ---------------------------------------------------------------------------
# Local fallback — simple romanization → jamo mapping for offline use
# ---------------------------------------------------------------------------

_ROMANIZATION: dict[str, str] = {
    "a": "ㅏ", "ae": "ㅐ", "ya": "ㅑ", "yae": "ㅒ",
    "eo": "ㅓ", "e": "ㅔ", "yeo": "ㅕ", "ye": "ㅖ",
    "o": "ㅗ", "wa": "ㅘ", "wae": "ㅙ", "oe": "ㅚ",
    "yo": "ㅛ", "u": "ㅜ", "wo": "ㅝ", "we": "ㅞ",
    "wi": "ㅟ", "yu": "ㅠ", "eu": "ㅡ", "ui": "ㅢ", "i": "ㅣ",
    "g": "ㄱ", "kk": "ㄲ", "n": "ㄴ", "d": "ㄷ", "tt": "ㄸ",
    "r": "ㄹ", "l": "ㄹ", "m": "ㅁ", "b": "ㅂ", "pp": "ㅃ",
    "s": "ㅅ", "ss": "ㅆ", "ng": "ㅇ", "j": "ㅈ", "jj": "ㅉ",
    "ch": "ㅊ", "k": "ㅋ", "t": "ㅌ", "p": "ㅍ", "h": "ㅎ",
}


def _local_fallback(text: str) -> str:
    """Best-effort romanization using a greedy local map (offline fallback)."""
    result = []
    i = 0
    lower = text.lower()
    while i < len(lower):
        matched = False
        for length in (3, 2, 1):
            chunk = lower[i:i + length]
            if chunk in _ROMANIZATION:
                result.append(_ROMANIZATION[chunk])
                i += length
                matched = True
                break
        if not matched:
            result.append(text[i])
            i += 1
    return "".join(result)
