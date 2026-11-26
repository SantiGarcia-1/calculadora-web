(() => {
  const voiceButton = document.querySelector('#voice-button');
  const expressionDisplay = document.querySelector('.expression');
  let recognition;
  let isListening = false;

  class VoiceInputError extends Error {}

  function showNotice(message) {
    expressionDisplay.textContent = message;
  }

  function resetListeningState() {
    isListening = false;
    voiceButton.classList.remove('escuchando');
    voiceButton.setAttribute('aria-pressed', 'false');
    voiceButton.setAttribute('aria-label', 'Iniciar reconocimiento de voz');
  }

  function translateTranscript(transcript) {
    const translated = transcript
      .toLocaleLowerCase('es-AR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\bmultiplicado\s+por\b/g, '*')
      .replace(/\bdividido(?:\s+por)?\b/g, '/')
      .replace(/\bentre\b/g, '/')
      .replace(/\bmas\b/g, '+')
      .replace(/\bmenos\b/g, '-')
      .replace(/\bpor\b/g, '*')
      .replace(/\b(?:coma|punto)\b/g, '.')
      .replace(/(\d)\s*,\s*(\d)/g, '$1.$2');

    if (translated.replace(/[0-9.+*/\-\s]/g, '') !== '') {
      throw new VoiceInputError('No entendí la operación.');
    }

    const expression = translated.replace(/[^0-9.+*/-]/g, '');
    if (!expression) {
      throw new VoiceInputError('No entendí la operación.');
    }

    return expression;
  }

  function calculateExpression(expression) {
    const tokens = expression.match(/\d+(?:\.\d*)?|\.\d+|[+\-*/]/g);
    if (!tokens || tokens.join('') !== expression) {
      throw new VoiceInputError('Revisa la operación e inténtalo otra vez.');
    }

    let position = 0;

    function parsePrimary() {
      const token = tokens[position];

      if (token === '+' || token === '-') {
        position += 1;
        const value = parsePrimary();
        return token === '-' ? -value : value;
      }

      if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
        throw new VoiceInputError('Revisa la operación e inténtalo otra vez.');
      }

      position += 1;
      return Number(token);
    }

    function parseMultiplication() {
      let value = parsePrimary();

      while (tokens[position] === '*' || tokens[position] === '/') {
        const operator = tokens[position];
        position += 1;
        const nextValue = parsePrimary();

        if (operator === '/' && nextValue === 0) {
          throw new VoiceInputError('No se puede dividir por cero.');
        }

        value = operator === '*' ? value * nextValue : value / nextValue;
      }

      return value;
    }

    function parseAddition() {
      let value = parseMultiplication();

      while (tokens[position] === '+' || tokens[position] === '-') {
        const operator = tokens[position];
        position += 1;
        const nextValue = parseMultiplication();
        value = operator === '+' ? value + nextValue : value - nextValue;
      }

      return value;
    }

    const result = parseAddition();
    if (position !== tokens.length || !Number.isFinite(result)) {
      throw new VoiceInputError('Revisa la operación e inténtalo otra vez.');
    }

    return result;
  }

  function showResult(transcript) {
    const expression = translateTranscript(transcript);
    const result = calculateExpression(expression);

    operando1 = result.toString();
    operando2 = '';
    operacion = '';
    actualizarDisplay(result);
    expressionDisplay.textContent = `${expression.replace(/([+\-*/])/g, ' $1 ').trim()} =`;
  }

  voiceButton.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotice('Voz no compatible con este navegador.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      voiceButton.classList.add('escuchando');
      voiceButton.setAttribute('aria-pressed', 'true');
      voiceButton.setAttribute('aria-label', 'Detener reconocimiento de voz');
      showNotice('Escuchando...');
    };

    recognition.onresult = (event) => {
      resetListeningState();
      try {
        showResult(event.results[event.resultIndex][0].transcript);
      } catch (error) {
        if (!(error instanceof VoiceInputError)) {
          throw error;
        }
        showNotice(error.message);
      }
    };

    recognition.onerror = (event) => {
      resetListeningState();
      const messages = {
        'not-allowed': 'Permiso de micrófono denegado.',
        'service-not-allowed': 'Permiso de micrófono denegado.',
        'no-speech': 'No se detectó voz.',
        'audio-capture': 'Micrófono no disponible.'
      };
      showNotice(messages[event.error] || 'No se pudo reconocer la voz.');
    };

    recognition.onend = () => {
      if (isListening) {
        resetListeningState();
        if (expressionDisplay.textContent === 'Escuchando...') {
          showNotice('No se detectó voz.');
        }
      }
    };

    try {
      recognition.start();
    } catch (error) {
      if (error.name !== 'InvalidStateError' && error.name !== 'NotAllowedError') {
        throw error;
      }
      resetListeningState();
      showNotice(
        error.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado.'
          : 'No se pudo iniciar el micrófono.'
      );
    }
  });
})();
