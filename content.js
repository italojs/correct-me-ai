const OPEN_API_KEY = // "YOUR_OPEN_API_KEY_HERE"
document.addEventListener('click', function(e) {
    let selectedText = window.getSelection().toString().trim();
    
    if (!e.target.closest('#language-popup') && !e.target.classList.contains('translation-icon')) {
        document.querySelectorAll('.translation-icon-container').forEach(container => container.remove());
    }

    if (selectedText.length > 0 && !e.target.closest('#language-popup') && !e.target.classList.contains('translation-icon')) {
        let container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '800px'; 
        container.style.height = 'auto';
        container.style.zIndex = '2147483647';
        container.classList.add('translation-icon-container');

        let icon = document.createElement('img');
        icon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAhQAAAIUB4uz/wQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKCSURBVEiJtZVNSBRhGMd/7+yuu4pWuxBohIiItkFZtChhW5B0KoiioFMQ0TEpT56CCDwWdBA6RdAlNMhDIdjHITMoy1hK3cA+UNh0tHVddm2cfeftYLvqrrOOSg/M4X2e9///zTMzzztCKUXRiF6NIbQrKBUCEQT+oIgBD7Fc99h7+3cxubAFjF6vwmU9QHGiiD5NeuIZMtlJqH/YOeBrWyNK9AGVxe4uF/pAHDl7kmM/3q4PGGkP4JIfgBpH5gBKwtTzGFqikXBMX1nSCja7rM4NmQMIFwSaqsiUv8ovrQaMtAdAXdyQeTZK/KBkkP7qXfYALdMClG4KAODbqaG52+0Bgt2bNgdwl4MQh/8fQFmArLUHwLYtAcwECE+qCEC82RLAmAXNN24P0NQLYJ2zw85cX7o8pU9XpgsHLXptAFRLdmkp6H6ZIrTHy5fvJmZGcbC+hHejBmePllHiEUsbY30gU0laJ1c95sJBs9QlYD63QcCR/T4GPxvMpy3iSYuBiEFT0LtsPheB9CR4K2/m2619FkXbzoHozk8PjS2SSFm0HvItJ+fHQH8NFfWPCH+6kK8p7ACg4W4PqPPArzXrsPTFxPpgZhAq6p6sZW4PyEK8WhC4X1BbnIOJx2CZU+zY10I4csbOxm0LAKi5MwfiMtG2OiCcy6e+gbvcIB2o5fhgupiFfQe5UAr4WJByl01xaqioOazXwb94P9nQPJPajinB8kLPz2Y8Kl552oHWQQcQSwYiadOHqXxIfBjSSzLjn3WidQQwpacXkNl1JpNB4el1orX/6edFV1fXgYWFheHp6Wn8fv+Njo6OW050jt4BgGEY0UQiMa7rerWUsmAI7eIvX1b2jh7te6MAAAAASUVORK5CYII=';
        icon.style.position = 'absolute';
        icon.style.top = e.clientY + 'px';
        icon.style.left = e.clientX + 'px';
        icon.style.cursor = 'pointer';

        container.appendChild(icon);
        document.body.appendChild(container);

        icon.onclick = function(event) {
            event.stopPropagation(); 
            if (!document.getElementById('language-popup')) {
                createPopup(e.clientX, e.clientY, selectedText, container);
            }
        };
    }
});

function createPopup(x, y, selectedText, container) {
    let popup = document.createElement('div');
    popup.id = 'language-popup';
    popup.style.position = 'absolute';
    popup.style.maxWidth = '600px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.zIndex = '2147483647';
    popup.style.padding = '10px';
    
    
    const popupWidth = 600; 
    const popupHeight = 150; 
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + popupWidth > windowWidth) {
        x = windowWidth - popupWidth - 100;
    }

    if (y + popupHeight > windowHeight) {
        y = windowHeight - popupHeight - 100;
    }

    popup.style.top = y + 'px';
    popup.style.left = x + 'px';

    let select = document.createElement('select');
    let options = ['English', 'Spanish', 'Portuguese'];
    options.forEach(option => {
        let opt = document.createElement('option');
        opt.textContent = option;
        select.appendChild(opt);
    });

    popup.appendChild(select);
    container.appendChild(popup); 


    let loading = document.createElement('div');
    loading.id = 'loading';
    loading.textContent = 'Loading...';
    popup.appendChild(loading);

    let correction = document.createElement('p');
    popup.appendChild(correction);

    let selectedLanguage = localStorage.getItem('selectedLanguage') || 'Inglês';

    const getCorrection = (language) => {
        loading.style.display = 'block';
        fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_API_KEY}`
            },
            body: JSON.stringify({
                prompt: `You are a teacher of language ${language}, if existent, indicate the gramatic errors and why is wrong of the following sentense, please, reply in ${language} language, be brief: "${selectedText}". `,
                max_tokens: 4000
            })
        })
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            if (data.choices && data.choices[0] && data.choices[0].text) {
                correction.textContent = data.choices[0].text.trim();
            } else {
                console.error('Sorry, i cant get the correction.');
            }
        })
        .catch(error => {
            loading.style.display = 'none';
            console.error('Erro:', error);
        });
    }

    getCorrection(selectedLanguage);
    select.value = selectedLanguage;

    select.addEventListener('change', function() {
        let language = select.value;
        localStorage.setItem('selectedLanguage', language);
        getCorrection(language);
    });

    container.appendChild(popup); 
}
