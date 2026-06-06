import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import requests as http
from concurrent.futures import ThreadPoolExecutor
from app.hangul import latin_to_hangul

translate_bp = Blueprint("translate", __name__)

MYMEMORY_URL = "https://api.mymemory.translated.net/get"
GOOGLE_INPUT_TOOLS_URL = "https://inputtools.google.com/request"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.google.com/",
    "Origin": "https://www.google.com",
    "Accept": "application/json",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mymemory_translate(text: str, lang_pair: str) -> str:
    try:
        r = http.get(MYMEMORY_URL, params={"q": text, "langpair": lang_pair}, timeout=5)
        return r.json()["responseData"]["translatedText"]
    except Exception:
        return ""


def _romanize(text: str) -> str:
    try:
        from hangul_romanize import Transliter
        from hangul_romanize import rule
        return Transliter(rule.academic).translit(text)
    except Exception:
        return ""


def _is_garbage(text: str, hangul: str, romanization: str) -> bool:
    """Detect if a MyMemory response is garbage (untranslated, name, or romanization)."""
    if not text or not text.strip():
        return True
    t = text.strip()
    tl = t.lower()
    hl = hangul.strip().lower()
    rl = romanization.strip().lower() if romanization else ""

    # Same as input (Hangul or romanization returned as-is)
    if tl == hl or tl == rl:
        return True
    # Looks like a Korean word (contains Hangul)
    if any("가" <= ch <= "힣" for ch in t):
        return True
    # Very short (1 char) or suspiciously long
    if len(t) <= 1:
        return True
    # Romanization embedded in the translation (e.g. "Anehash", "Agnon")
    if rl and len(rl) >= 4:
        # Check if translation is just a mangled version of the romanization
        t_alpha = tl.replace(" ", "").replace("-", "").replace("!", "").replace(".", "")
        r_alpha = rl.replace("-", "")
        if t_alpha and r_alpha and (t_alpha in r_alpha or r_alpha.startswith(t_alpha[:4])):
            return True
    # Looks like a proper name (short, single capitalized word with punctuation)
    if re.match(r'^[A-Z][a-z]{1,8}[!?.]?$', t):
        return True
    return False


def _translate_ko_pt(hangul: str, romanization: str) -> tuple[str, str]:
    """
    Translate Korean to Portuguese using a two-step approach:
    Korean → English → Portuguese (much better coverage than direct ko|pt).
    Returns (translation, lang_code).
    """
    # Step 1: Korean → English
    en = _mymemory_translate(hangul, "ko|en")
    if _is_garbage(en, hangul, romanization):
        return "", ""

    # Step 2: English → Portuguese
    pt = _mymemory_translate(en, "en|pt")
    if pt and not _is_garbage(pt, en, ""):
        return pt, "pt"

    # Fallback: return English if Portuguese step fails
    return en, "en"


def _enrich_candidate(hangul: str) -> dict:
    """Translate + romanize a single Hangul candidate."""
    romanization          = _romanize(hangul)
    translation, trans_lang = _translate_ko_pt(hangul, romanization)
    return {
        "hangul":       hangul,
        "romanization": romanization,
        "translation":  translation,
        "trans_lang":   trans_lang,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@translate_bp.route("", methods=["POST"])
@jwt_required()
def translate():
    """Translate text via MyMemory API."""
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    lang_pair = (data or {}).get("lang_pair", "pt|en")

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    try:
        resp = http.get(MYMEMORY_URL, params={"q": text, "langpair": lang_pair}, timeout=5)
        result = resp.json()
        translated = result["responseData"]["translatedText"]
        return jsonify({"original": text, "translated": translated, "lang_pair": lang_pair}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@translate_bp.route("/hangul", methods=["POST"])
@jwt_required()
def translate_hangul():
    """Romanization → Hangul via Google Input Tools."""
    data = request.get_json()
    text = (data or {}).get("text", "").strip()

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    hangul = latin_to_hangul(text)
    return jsonify({"original": text, "hangul": hangul}), 200


@translate_bp.route("/romanize", methods=["POST"])
@jwt_required()
def romanize_hangul():
    """Hangul → romanization."""
    data = request.get_json()
    text = (data or {}).get("text", "").strip()

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    return jsonify({"original": text, "romanization": _romanize(text)}), 200


def _google_input_tools(text: str) -> list[str]:
    """Try to get Hangul candidates from Google Input Tools API."""
    try:
        r = http.get(
            GOOGLE_INPUT_TOOLS_URL,
            params={"text": text, "itc": "ko-t-i0-und", "num": "5",
                    "cp": "0", "cs": "1", "ie": "utf-8", "oe": "utf-8"},
            headers=HEADERS,
            timeout=6,
        )
        data = r.json()
        if data[0] == "SUCCESS" and data[1] and data[1][0][1]:
            return data[1][0][1]
    except Exception:
        pass
    return []


def _romanization_to_hangul(text: str) -> str:
    """
    Local romanization → Hangul with syllable composition.
    Handles standard Korean romanization (revised romanization).
    """
    text = text.lower().strip()

    # --- Jamo tables ---
    CHOSEONG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
                 'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
    JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ',
                 'ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
    JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ',
                 'ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ',
                 'ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

    cho_idx  = {c: i for i, c in enumerate(CHOSEONG)}
    jung_idx = {v: i for i, v in enumerate(JUNGSEONG)}
    jong_idx = {c: i for i, c in enumerate(JONGSEONG) if c}

    def compose(cho: str, jung: str, jong: str = '') -> str:
        ci = cho_idx.get(cho, 11)   # default ㅇ (silent)
        vi = jung_idx.get(jung, 0)
        ji = jong_idx.get(jong, 0)
        return chr(0xAC00 + (ci * 21 + vi) * 28 + ji)

    # Greedy pattern → jamo (vowels before consonants, longest first)
    PATTERNS = [
        ('yae','ㅒ'),('yeo','ㅕ'),('wae','ㅙ'),
        ('ae','ㅐ'),('ya','ㅑ'),('eo','ㅓ'),('ye','ㅖ'),
        ('wa','ㅘ'),('oe','ㅚ'),('yo','ㅛ'),('wo','ㅝ'),
        ('we','ㅞ'),('wi','ㅟ'),('yu','ㅠ'),('eu','ㅡ'),('ui','ㅢ'),
        ('a','ㅏ'),('e','ㅔ'),('o','ㅗ'),('u','ㅜ'),('i','ㅣ'),
        ('kk','ㄲ'),('tt','ㄸ'),('pp','ㅃ'),('ss','ㅆ'),('jj','ㅉ'),
        ('ch','ㅊ'),('ng','ㅇ'),
        ('g','ㄱ'),('k','ㅋ'),('n','ㄴ'),('d','ㄷ'),('t','ㅌ'),
        ('r','ㄹ'),('l','ㄹ'),('m','ㅁ'),('b','ㅂ'),('p','ㅍ'),
        ('s','ㅅ'),('j','ㅈ'),('h','ㅎ'),
    ]
    VOWEL_SET = {j for p, j in PATTERNS if p[0] in 'aeiouyw'}

    # Parse into jamo list
    jamo: list[str] = []
    i = 0
    while i < len(text):
        for pat, jam in PATTERNS:
            if text[i:i+len(pat)] == pat:
                jamo.append(jam)
                i += len(pat)
                break
        else:
            jamo.append(text[i])   # non-Korean char passthrough
            i += 1

    # Compose jamo into syllables
    result: list[str] = []
    i = 0
    n = len(jamo)

    while i < n:
        j = jamo[i]

        if j in VOWEL_SET:
            # Vowel-only syllable (silent ㅇ onset)
            if i + 1 < n and jamo[i+1] not in VOWEL_SET and jamo[i+1] in jong_idx:
                # Use consonant as coda if at end of word OR followed by another consonant
                if i + 2 < n and jamo[i+2] in VOWEL_SET:
                    # Consonant becomes onset of next syllable → no coda here
                    result.append(compose('ㅇ', j))
                else:
                    result.append(compose('ㅇ', j, jamo[i+1]))
                    i += 1
            else:
                result.append(compose('ㅇ', j))
            i += 1

        elif j in cho_idx:
            if i + 1 < n and jamo[i+1] in VOWEL_SET:
                vowel = jamo[i+1]
                if i + 2 < n and jamo[i+2] not in VOWEL_SET and jamo[i+2] in jong_idx:
                    # Coda stays if at end of word OR followed by another consonant
                    if i + 3 < n and jamo[i+3] in VOWEL_SET:
                        # Consonant at i+2 becomes next onset → no coda
                        result.append(compose(j, vowel))
                        i += 2
                    else:
                        result.append(compose(j, vowel, jamo[i+2]))
                        i += 3
                else:
                    result.append(compose(j, vowel))
                    i += 2
            else:
                result.append(j)   # bare consonant, no vowel follows
                i += 1
        else:
            result.append(j)
            i += 1

    return ''.join(result)


# Common K-drama / informal spellings → (hangul, portuguese_translation)
# Translation is hardcoded to guarantee quality regardless of MyMemory
_KDRAMA_DICT: dict[str, tuple[str, str]] = {
    # Greetings
    "anyong":            ("안녕",      "Oi / Tchau"),
    "annyeong":          ("안녕",      "Oi / Tchau"),
    "annyeonghaseyo":    ("안녕하세요", "Olá (formal)"),
    "annyeonghaseio":    ("안녕하세요", "Olá (formal)"),
    "anehaseio":         ("안녕하세요", "Olá (formal)"),
    "anehaseyo":         ("안녕하세요", "Olá (formal)"),
    # Love / feelings
    "saranghae":         ("사랑해",    "Eu te amo"),
    "saranghayo":        ("사랑해요",  "Eu te amo (formal)"),
    "saranghamnida":     ("사랑합니다","Eu te amo (muito formal)"),
    "bogosipeo":         ("보고싶어",  "Estou com saudade de você"),
    "bogoshipo":         ("보고싶어",  "Estou com saudade de você"),
    "joayo":             ("좋아요",    "Eu gosto / Está bom"),
    "joa":               ("좋아",      "Eu gosto"),
    "silheo":            ("싫어",      "Eu odeio / Não quero"),
    "mianhae":           ("미안해",    "Desculpa"),
    "mianhe":            ("미안해",    "Desculpa"),
    "mianhamnida":       ("미안합니다","Desculpe-me (formal)"),
    # Exclamations
    "aigoo":             ("아이고",    "Nossa! / Ai meu Deus!"),
    "aigo":              ("아이고",    "Nossa! / Ai meu Deus!"),
    "aish":              ("아이씨",    "Droga! / Que chato!"),
    "aissi":             ("아이씨",    "Droga! / Que chato!"),
    "omo":               ("어머",      "Nossa! / Uau!"),
    "omona":             ("어머나",    "Nossa! (surpresa)"),
    "daebak":            ("대박",      "Incrível! / Que sorte!"),
    "jinjja":            ("진짜",      "Sério? / De verdade?"),
    "jinja":             ("진짜",      "Sério? / De verdade?"),
    "ottoke":            ("어떡해",    "O que eu faço? / Que situação!"),
    "eotteoke":          ("어떡해",    "O que eu faço?"),
    "hwaiting":          ("화이팅",    "Vai lá! / Força! / Você consegue!"),
    "fighting":          ("화이팅",    "Vai lá! / Força!"),
    # Family / formas de tratamento
    "oppa":              ("오빠",      "Irmão mais velho (dito por mulher)"),
    "opa":               ("오빠",      "Irmão mais velho (dito por mulher)"),
    "unni":              ("언니",      "Irmã mais velha (dito por mulher)"),
    "onni":              ("언니",      "Irmã mais velha (dito por mulher)"),
    "noona":             ("누나",      "Irmã mais velha (dito por homem)"),
    "nuna":              ("누나",      "Irmã mais velha (dito por homem)"),
    "hyung":             ("형",        "Irmão mais velho (dito por homem)"),
    "ajeossi":           ("아저씨",    "Tio / Senhor"),
    "ajusshi":           ("아저씨",    "Tio / Senhor"),
    "ahjumma":           ("아줌마",    "Tia / Senhora"),
    "ajumma":            ("아줌마",    "Tia / Senhora"),
    "dongsaeng":         ("동생",      "Irmão/irmã mais novo(a)"),
    "namja":             ("남자",      "Homem / Garoto"),
    "yeoja":             ("여자",      "Mulher / Garota"),
    "namjachingu":       ("남자친구",  "Namorado"),
    "yeojachingu":       ("여자친구",  "Namorada"),
    # Pedidos / perguntas
    "juseyo":            ("주세요",    "Por favor me dê / Quero..."),
    "mollayo":           ("몰라요",    "Não sei (formal)"),
    "molla":             ("몰라",      "Não sei"),
    "kajima":            ("가지마",    "Não vá / Não saia"),
    "gajima":            ("가지마",    "Não vá / Não saia"),
    "jebal":             ("제발",      "Por favor"),
    "ppalli":            ("빨리",      "Rápido! / Depressa!"),
    "ppalali":           ("빨리",      "Rápido! / Depressa!"),
    "jamsiman":          ("잠시만",    "Um momento / Espera"),
    "jamkkan":           ("잠깐",      "Um segundo / Espera"),
    # Agradecimentos
    "kamsahamnida":      ("감사합니다","Obrigado(a) (formal)"),
    "gamsahamnida":      ("감사합니다","Obrigado(a) (formal)"),
    "gomawo":            ("고마워",    "Obrigado(a) (informal)"),
    "gomaweo":           ("고마워",    "Obrigado(a) (informal)"),
    "gwenchana":         ("괜찮아",    "Tudo bem / Não tem problema"),
    "gwaenchana":        ("괜찮아",    "Tudo bem / Não tem problema"),
    # Comidas
    "kimchi":            ("김치",      "Kimchi (prato fermentado coreano)"),
    "ramyeon":           ("라면",      "Macarrão instantâneo coreano"),
    "ramen":             ("라면",      "Macarrão instantâneo coreano"),
    "tteokbokki":        ("떡볶이",    "Bolinhos de arroz apimentados"),
    "bibimbap":          ("비빔밥",    "Arroz misturado com legumes e carne"),
    "samgyeopsal":       ("삼겹살",    "Barriga de porco grelhada"),
    # Outros
    "haengbok":          ("행복",      "Felicidade"),
    "neo":               ("너",        "Você (informal)"),
    "na":                ("나",        "Eu (informal)"),
    "uri":               ("우리",      "Nós / Nosso"),
    "mashisseo":         ("맛있어",    "Está delicioso!"),
    "massisseo":         ("맛있어",    "Está delicioso!"),
    "naesarang":         ("내 사랑",   "Meu amor"),
    "nae sarang":        ("내 사랑",   "Meu amor"),
    "bogoshipo":         ("보고싶어",  "Estou com saudade"),
}


def _local_phonetic_candidates(text: str) -> list[str]:
    key = text.lower().strip()
    if key in _KDRAMA_DICT:
        return [_KDRAMA_DICT[key][0]]   # return only the Hangul
    hangul = _romanization_to_hangul(text)
    if any("가" <= ch <= "힣" for ch in hangul):
        return [hangul]
    return []


@translate_bp.route("/phonetic-search", methods=["POST"])
@jwt_required()
def phonetic_search():
    """
    Phonetic search: user types what they heard (e.g. 'anyong') and gets
    multiple Korean word candidates with translation and romanization.

    Body:   { "text": "anyong" }
    Returns: { "query": "anyong", "results": [ { hangul, romanization, translation }, ... ] }
    """
    data = request.get_json()
    text = (data or {}).get("text", "").strip()

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    key = text.lower().strip()

    # 1. Dictionary match — guaranteed correct translation
    if key in _KDRAMA_DICT:
        hangul, translation = _KDRAMA_DICT[key]
        romanization = _romanize(hangul)
        return jsonify({
            "query": text,
            "results": [{
                "hangul":       hangul,
                "romanization": romanization,
                "translation":  translation,
                "trans_lang":   "pt",
            }]
        }), 200

    # 2. Try Google Input Tools
    candidates = _google_input_tools(text)

    # 3. Local romanization fallback
    if not candidates:
        candidates = _local_phonetic_candidates(text)

    if not candidates:
        return jsonify({"query": text, "results": []}), 200

    # 4. Enrich with translation + romanization
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(_enrich_candidate, candidates))

    return jsonify({"query": text, "results": results}), 200
