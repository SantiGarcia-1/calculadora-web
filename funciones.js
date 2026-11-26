function obtenerDisplay() {
    return document.querySelector('.display .content');
}


function actualizarDisplay(valor) {
    const texto = valor.toString();
    const display = obtenerDisplay();
    display.textContent = texto;
    display.style.fontSize = `${Math.max(16, Math.min(44, (44 * 12) / texto.length))}px`;
}

let operando1 = '';
let operando2 = '';
let operacion = '';

function manejarOperacion(valor) {
    if (valor === '+' || valor === '-' || valor === 'x' || valor === '÷' || valor === '%') {
        operacion = valor;
        if (operando1 !== '') {
            document.querySelector('.expression').textContent = operando1 + ' ' + operacion;
        }
    } else if (valor === '=' && operando1 !== '' && operando2 !== '') {
            let resultado = calcularResultado(parseFloat(operando1), parseFloat(operando2), operacion);
            actualizarDisplay(resultado);
            document.querySelector('.expression').textContent = operando1 + ' ' + operacion + ' ' + operando2 + ' =';
            operando1 = resultado.toString();
            operando2 = '';
            operacion = '';
    } else if (operacion === '') {
            operando1 += valor;
            document.querySelector('.expression').textContent = '';
            actualizarDisplay(operando1);
        } else { 
            operando2 += valor;
            actualizarDisplay(operando2);
        }
        }
    



function calcularResultado(num1, num2, operador) {
    if(operador === '+') return num1 + num2;
    if (operador === '-') return num1 - num2;
    if (operador === 'x') return num1 * num2;
    if (operador === '÷' && (num2 !== 0)) return num1/num2;                 
    if (operador === '%') return (num1 * num2)/ 100;
    return 'Error';  
   }   


document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function() {
        let valor = this.querySelector('.key').textContent;
        manejarOperacion(valor);
    });
});


document.getElementById('on').addEventListener('click', function() {
    limpiarDisplay();
});

function limpiarDisplay() {
    obtenerDisplay().textContent = '0';
    obtenerDisplay().style.fontSize = '44px';
    document.querySelector('.expression').textContent = '';
    operando1 = '';
    operando2 = '';
    operacion = '';
}

let botonOn = document.getElementById('on');
let botonOff = document.getElementById('off');
let displayContent = document.querySelector('.content');

function apagarDisplay() {
    displayContent.textContent = ''; 
    document.querySelector('.display').classList.add('off');
}

function encenderDisplay() {
    document.querySelector('.display').classList.remove('off');
}

botonOff.addEventListener('click', apagarDisplay);

botonOn.addEventListener('click', encenderDisplay);

document.getElementById('ac').addEventListener('click', limpiarDisplay);
document.getElementById('c').addEventListener('click', function() {
    if (operacion !== '') {
        operando2 = '';
    } else {
        operando1 = '';
    }
    actualizarDisplay('0');
});

document.addEventListener('keydown', function(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.target instanceof HTMLElement && event.target.isContentEditable) return;

    const botones = {
        '0': 'cero',
        '1': 'uno',
        '2': 'dos',
        '3': 'tres',
        '4': 'cuatro',
        '5': 'cinco',
        '6': 'seis',
        '7': 'siete',
        '8': 'ocho',
        '9': 'nueve',
        '+': 'suma',
        '-': 'resta',
        '*': 'multiplicado',
        '/': 'dividido',
        '.': 'punto',
        '%': 'porcentaje',
        Enter: 'igual',
        Escape: 'ac'
    };
    const idBoton = botones[event.key];

    if (idBoton) {
        event.preventDefault();
        document.getElementById(idBoton).click();
        return;
    }

    if (event.key === 'Backspace') {
        event.preventDefault();
        if (operacion !== '') {
            operando2 = operando2.slice(0, -1);
            actualizarDisplay(operando2 || '0');
        } else {
            operando1 = operando1.slice(0, -1);
            actualizarDisplay(operando1 || '0');
        }
        document.querySelector('.buttons').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
});

