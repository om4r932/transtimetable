document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('mode');
    const operatorSelect = document.getElementById('operator');
    const lineSelect = document.getElementById('line');
    const stopSelect = document.getElementById('stop');

    fetch('/modes')
        .then(response => response.json())
        .then(modes => {
            Object.keys(modes).sort().forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = modes[key];
                modeSelect.appendChild(option);
            });
            modeSelect.disabled = false;
        });

    modeSelect.addEventListener('change', () => {
        operatorSelect.innerHTML = '<option value="">Sélectionnez un opérateur</option>';
        lineSelect.innerHTML = '<option value="">Sélectionnez une ligne</option>';
        stopSelect.innerHTML = '<option value="">Sélectionnez un arrêt</option>';
        operatorSelect.disabled = true;
        lineSelect.disabled = true;
        stopSelect.disabled = true;

        if (modeSelect.value) {
            fetch(`/operators/${modeSelect.value}`)
                .then(response => response.json())
                .then(operators => {
                    operators.sort().forEach(operator => {
                        const option = document.createElement('option');
                        option.value = operator;
                        option.textContent = operator;
                        operatorSelect.appendChild(option);
                    });
                    operatorSelect.disabled = false;
                });
        }
    });

    operatorSelect.addEventListener('change', () => {
        lineSelect.innerHTML = '<option value="">Sélectionnez une ligne</option>';
        stopSelect.innerHTML = '<option value="">Sélectionnez un arrêt</option>';
        lineSelect.disabled = true;
        stopSelect.disabled = true;

        if (operatorSelect.value) {
            fetch(`lines/${modeSelect.value}/${operatorSelect.value}`)
                .then(response => response.json())
                .then(lines => {
                    Object.keys(lines).sort().forEach(line => {
                        const option = document.createElement('option');
                        option.value = line;
                        option.textContent = lines[line];
                        lineSelect.appendChild(option);
                    });
                    lineSelect.disabled = false;
                });
        }
    });

    lineSelect.addEventListener('change', () => {
        stopSelect.innerHTML = '<option value="">Sélectionnez un arrêt</option>';
        stopSelect.disabled = true;

        if (lineSelect.value) {
            fetch(`/stops/${lineSelect.value}`)
                .then(response => response.json())
                .then(stops => {
                    Object.keys(stops).sort().forEach(stop => {
                        const option = document.createElement('option');
                        option.value = stop;
                        option.textContent = stop;
                        stopSelect.appendChild(option);
                    });
                    stopSelect.disabled = false;
                });
        }
    });

    // Submit
    const form = document.getElementById('transportForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const lineid = lineSelect.value;
        const stops = await fetch(`/stops/${lineid}`).then(response => response.json());
        const stopids = stops[stopSelect.value];
        var outputString = ""
        for(const stopid of stopids){
            const nextStop = await fetch(`/nextStop/${stopid}/${lineid}`).then(response => response.text());
            outputString += nextStop + "<br>";
        }
        document.getElementById('output').innerHTML = outputString;
    });
});