function switch_dark_mode_icon(settings, id) {
    const newMode = localStorage.getItem('dark-mode') === 'dark' ? 'light' : 'dark';
  
    render_dark_mode_icon(newMode, id);
    set_dark_mode(settings, newMode);
    localStorage.setItem('dark-mode', newMode);
}

function set_dark_mode(settings, mode) {
    if (mode === 'dark') {
        DarkReader.enable(settings);
    } else {
        DarkReader.disable();
    }
}

function render_dark_mode_icon(mode, id) {
    if (mode === 'dark') {
        document.getElementById(id).classList.remove('fa-sun');
        document.getElementById(id).classList.add('fa-moon');
    } else {
        document.getElementById(id).classList.remove('fa-moon');
        document.getElementById(id).classList.add('fa-sun'); 
    }
}

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/&/g, '-and-')
        .replace(/[\s\W-]+/g, '-')
        .replace(/[^a-zA-Z0-9-_]+/g,'')
        .replace(/^-/, '');
}