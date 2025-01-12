async function main() {
    const response = await fetch('/solutions/directory.txt');
    const directory = await response.text();
    const solutions = directory.split('\n');
    const solutionsElement = document.getElementById('solutions');
    console.log(directory);

    solutions.forEach(async name => {
        const response2 = await fetch(`/solutions/${name}.json`);
        const solution = await response2.json();
        const element = document.createElement('div');
        element.classList.add('solution')
        element.innerHTML = `
        <h2 class="${solution.color}"><a href="?s=${solution.name.toLowerCase()}">${solution.name}</a></h2>
        <p>${solution.description}</p>
        `
        solutionsElement.appendChild(element);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const solutionName = urlParams.get('s').toLowerCase();

    const statusToColor = {
        'a-m': 'green',
        'd': 'red',
        'i-d': 'yellow',
        'm': 'blue',
    }
    const statusToText = {
        'a-m': 'Active Maintenance',
        'd': 'Deprecated',
        'i-d': 'In Development',
        'm': 'Maintenance',
    }
    if (solutionName) {
        const response3 = await fetch(`/solutions/${solutionName.toLowerCase()}.json`);
        const solution = await response3.json();
        const element = document.createElement('div');
        element.classList.add('solution-detail');
        element.innerHTML = `
        <h2 class="${solution.color}">${solution.name}</h2>
        <p>${solution.description}</p>
        <p>License: ${solution.license}<p>
        <p>Status: <span class="${statusToColor[solution.status]}">${statusToText[solution.status]}</span></p>
        `
        document.getElementById('body').append(element);
    }
}

main();