window.addEventListener('scroll', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight) {
            element.style.opacity = 1;
        } else {
            element.style.opacity = 0;
        }
    });
});
