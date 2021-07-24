function switch_dark_mode_icon(settings, id) {
    const body = document.getElementsByTagName('body')[0];
    const root = document.documentElement;
    if (localStorage.darkModeCustom === 'dark') {
        localStorage.darkModeCustom = 'light';
        root.setAttribute('dark-mode', 'light');
    } else {
        localStorage.darkModeCustom = 'dark';
        root.setAttribute('dark-mode', 'dark');
    }
    /*
    const enabled = localStorage.getItem('dark-mode');
    if (enabled === 'true') {
        DarkReader.disable();
        localStorage.setItem('dark-mode', 'false')
    } else if (enabled === 'false') {
        DarkReader.enable(settings);
        localStorage.setItem('dark-mode', 'true');
    }
    if (DarkReader.isEnabled()) {
        DarkReader.disable();
    } else {
        DarkReader.enable(settings);
    }
    */
    render_dark_mode_icon(id);
}

function render_dark_mode_icon(id) {
    const body = document.getElementsByTagName("body")[0];
    const root = document.documentElement;
    if (localStorage.darkModeCustom === 'dark') {
        document.getElementById(id).classList.remove('fa-sun');
        document.getElementById(id).classList.add('fa-moon'); 
        root.setAttribute('dark-mode', 'dark');
    } else {
        document.getElementById(id).classList.remove('fa-moon');
        document.getElementById(id).classList.add('fa-sun'); 
        root.setAttribute('dark-mode', 'light');
    }

    /*var x = document.getElementsByTagName("img");
    const enabled = localStorage.getItem('dark-mode');

    console.log(x)
    if (enabled === 'true') {
        document.getElementById(id).classList.remove('fa-sun');
        document.getElementById(id).classList.add('fa-moon');
    } else if (enabled === 'false') {
        document.getElementById(id).classList.remove('fa-moon');
        document.getElementById(id).classList.add('fa-sun');
    }
    */
}

