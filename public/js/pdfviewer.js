console.log("PDF viewer is running")


const element = document.getElementsByClassName('viewer');
WebViewer({
    path: '/js/pdfjsExpress',
    disabledElements: [
        'viewControlsButton', 'ribbons', 'selectToolButton', 'printButton', 'contextMenuPopup'
    ],
    initialDoc: `/${pdfPath}`
}, document.getElementById('viewer'))
    .then(instance => {
        // now you can access APIs through the WebViewer instance
        const { Core, UI } = instance;
        // UI.closeElements(['viewControls','menu'])
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            UI.setTheme('dark')
        } else {
            // Light
            UI.setTheme('light')
        }

        // adding an event listener for when a document is loaded
        Core.documentViewer.addEventListener('documentLoaded', () => {
            console.log('document loaded');
        });

        // adding an event listener for when the page number has changed
        Core.documentViewer.addEventListener('pageNumberUpdated', (pageNumber) => {
            console.log(`Page number is: ${pageNumber}`);
        });
    })