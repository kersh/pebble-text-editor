/* 
 * Pebble Text Editor
 * Copyright @ Pebble Learning
 */
;




(function(window, document, undefined){ // ============ MOBILE
//------------------------------------------
// All Variables defined here
//------------------------------------------

    // Helpers
    var sel_type          = "Caret";     // variable to store type of selection: caret or range
    var container_id      = 0;           // Needs to detect which container currently is edited
    var show_menu_class   = "show-menu"; // Class for making visible the context menus
    var is_italic         = false;       // Variable for removing extra formatting from any of paragraphs
    var placeholder       = "none";      // Is a placeholder for input field when create a web/email link

    var timer = null;  // Timer for mobile and tablet devices
    var selectedRange; // Selected range for mobile and tablet devices

    // All core elements
    var arrow_pointer     = document.getElementById("arrow-pointer");                // arrow icon that pointing on selection
    var content_elements  = document.getElementsByClassName("text-editor-content");  // set of core editor elements (editable divs)
    var textarea_elements = document.getElementsByClassName("text-editor-textarea"); // set of core editor elements (editable divs)
    var format_tools_div  = document.getElementById("toolbar");                      // div with formatting tools
    var main_menu         = document.getElementById("main-menu");                    // main menu
    var color_menu        = document.getElementById("color-menu");                   // context menu that holds color pallete
    var paragraph_menu    = document.getElementById("paragraph-menu");               // context menu that holds heading/paragraph styles

    // List of tools for rich editing
    var formatTools = [];
    formatTools['toggle-bold']                   = document.getElementById("toggle-bold");
    formatTools['toggle-italic']                 = document.getElementById("toggle-italic");

    formatTools['toggle-color-menu']             = document.getElementById("toggle-color-menu");
        formatTools['color-red']                 = document.getElementById("color-red");
        formatTools['color-green']               = document.getElementById("color-green");
        formatTools['color-blue']                = document.getElementById("color-blue");
        formatTools['back-main-from-color']      = document.getElementById("back-main-from-color");
    
    formatTools['toggle-paragraph-menu']         = document.getElementById("toggle-paragraph-menu");
        formatTools['toggle-heading-h1']         = document.getElementById("toggle-heading-h1");
        formatTools["toggle-heading-h2"]         = document.getElementById("toggle-heading-h2");
        formatTools['back-main-from-paragraph']  = document.getElementById("back-main-from-paragraph");
    
    formatTools['toggle-web-link']               = document.getElementById("toggle-web-link");
    formatTools['toggle-email-link']             = document.getElementById("toggle-email-link");
        formatTools['edit-link']                 = document.getElementById("edit-link");
        formatTools['open-link']                 = document.getElementById("open-link");

    formatTools["remove-formatting"]             = document.getElementById("remove-formatting");




//------------------------------------------
// Helper functions
//------------------------------------------

    /*
     * Checks if element has particular class
     */
    function hasClass(element, class_name) {
        return element.className.match(new RegExp('(\\s|^)' + class_name + '(?!\S)'));
    }

    /*
     * Adds class/classes to an element
     */
    function addClass(element, class_name) {
        if (!hasClass(element, class_name)) { element.className += " " + class_name; }
    }

    /*
     * Removes class/classes from an element
     */
    function removeClass(element, class_name) {
        if (hasClass(element, class_name)) {
            var regexp = new RegExp('(\\s|^)' + class_name + '(?!\S)');
            element.className = element.className.replace(regexp, '');
        }
    }

    /*
     * Validates email address
     * @email - is a variable that you want to check
     * @return - true/false
     */
    function validateEmail(email) {
        var regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regExp.test(email);
    }

    /*
     * Hide all open context menus at the same time
     */
    function hideAllContextMenus() {
        if(hasClass(main_menu, "hide-main-menu")) {
            removeClass(main_menu, "hide-main-menu");
        }

        if(hasClass(color_menu, "hide-menu")) {
            removeClass(color_menu, "hide-menu");
        }

        if(hasClass(paragraph_menu, "hide-menu")) {
            removeClass(paragraph_menu, "hide-menu");
        }
    }

    /*
     * Saves user's text selection
     */
    function saveSelection() {
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                var ranges = [];
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    ranges.push(sel.getRangeAt(i));
                }
                return ranges;
            }
        } else if (document.selection && document.selection.createRange) {
            return document.selection.createRange();
        }
        return null;
    }

    /*
     * Restores saved user's text selection
     */
    function restoreSelection(savedSel) {
        if (savedSel) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                for (var i = 0, len = savedSel.length; i < len; ++i) {
                    sel.addRange(savedSel[i]);
                }
            } else if (document.selection && savedSel.select) {
                savedSel.select();
            }
        }
    }

    /*
     * 
     */
    function clearAllSelections() {
        if (window.getSelection) { // All browsers
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
        else if (document.selection) { // Damn special IE
            var range = document.selecion.createRange();
            document.selecion.empty();
        }
    }    






//------------------------------------------
// Editor core functions
//------------------------------------------

    /*
     * Update textarea.
     * This function saves everything from editable div into <textarea> to make it easy to submit data to back-end.
     * 
     * @evt event object
     * @id the id of editable div in a DOM tree
     */
    function updateTextarea(evt, id) {
        container_id = id;
        var div_content = evt.target.innerHTML;        // save contents from current editable div to a variable
        textarea_elements[id].value = div_content;     // copy content from editable div into right textarea
    }

    /*
     * Show formatting tools
     *
     * @top defines coordinates of bottom line of selection
     * @left defines starting point of selection from left side
     */
    function showTools(top, left) {
        format_tools_div.style.top = top + "px";       // Locate tools
        format_tools_div.style.left = left + "px";     // below the selection
        addClass(format_tools_div, "show-tools");      // Adding class to make tools visible
    }

    /*
     * Hide formatting tools
     */
    function hideTools() {
        removeClass(format_tools_div, "show-tools");   // Removes class to hide tools
        
        // Hide all context menus
        hideAllContextMenus();
    }

    /*
     * Checks if user selected something or not.
     *
     * @selection
     * @return "Caret" or "Range" accordingly
     */
    function checkSelectionType(selection) {
        var selection_type;
        // for normal browsers
        if(selection.type) {
            selection_type = selection.type;
        }
        
        // for IE
        else {
            if(selection.toString().length > 0) {
                selection_type = "Range";
            } else {
                selection_type = "Caret";
            }
        }

        return selection_type;
    }

    /*
     * Checks if selection contains link.
     * If yes, then change button in a toolbar.
     */
    function checkExistingLink() {
        
        // Damn IE is special!
        if (isMSIE) {
            var selection = document.selection.createRange();
            var selected_link = selection.parentElement().href;      // Get the selected link href
        }
        // All normal browsers
        else {
            var selection = window.getSelection();
            var selected_link = selection.anchorNode.parentNode.href; // Get the selected link href
        }

        // If there is a link
        if (!!selected_link) {
            placeholder = selected_link;
            addClass(main_menu, "is-link");
        } else {
            placeholder = "none";
            removeClass(main_menu, "is-link");
        }
    }

    /*
     * Function that defines position of formatting tools on the screen.
     * It finds the position of selected range and places toolbox next to that.
     */
    var positionTools = function(){
        var oRange, oRect, selection, sel_width, sel_height;

        selection = window.getSelection();
        sel_type = checkSelectionType(selection); // defines whether user selected text or not

        // Show formatting tools if user selected anything
        if(sel_type === "Range") {
            // Define position of selection
            oRange = selection.getRangeAt(0);
            oRect = oRange.getBoundingClientRect();

            // Height and width of selecion
            sel_height = oRect.bottom - oRect.top;
            sel_width = oRect.right - oRect.left;
            
            // Should move arrow pointer in the middle of selection
            if(sel_width > 10){
                sel_width = (sel_width - 10) / 2;
                arrow_pointer.style.marginLeft = sel_width + "px";
            }
            else {
                arrow_pointer.style.marginLeft = "0px";
            }

            // Check if web link or email link currently selected to show different menu
            checkExistingLink();

            // FIX LATER
            var width_em = 28.688;
            var mobile_width = width_em * 16;

            if (window.innerWidth < mobile_width) {
                showTools(oRect.top + sel_height, 0);
            } else {
                // Place tools in right place
                showTools(oRect.top + sel_height, oRect.left);
            }
        }
        // Hide tools when not used
        else {
            hideTools();
        }
    }






//------------------------------------------
// Formatting tools functions
//------------------------------------------

    /*
     * Make text bold and backwards
     */
    function toggleBold() {
        document.execCommand("bold", false, null);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make text italic and backwards
     */
    function toggleItalic() {
        document.execCommand("italic", false, null);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleColorMenu() {
        // Remove or add class from main menu
        if(hasClass(main_menu, "hide-main-menu")) {
            removeClass(main_menu, "hide-main-menu");
        } else {
            addClass(main_menu, "hide-main-menu");
        }
        
        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleParagraphMenu() {
        // Add or remove class from main menu
        // Remove color menu if needed
        if(hasClass(main_menu, "hide-main-menu")) {
            removeClass(main_menu, "hide-main-menu");
            setTimeout(function() { // Need timeout same long as CSS3 transition
                removeClass(color_menu, "hide-menu");
            }, 150);
        } else {
            addClass(color_menu, "hide-menu");
            addClass(main_menu, "hide-main-menu");
        }
    }

    /*
     * Make Web link and backwards
     */
    function toggleWebLink() {
        hideAllContextMenus();

        var saved_selection = saveSelection(); // Save selection for link. Fix for touch devices

        if (placeholder == "none") {
            placeholder = "http://";
        }

        var url = prompt("Please enter web link (e.g.: http://www.domain.co.uk)", placeholder);
        // If NOT null and NOT empty
        if(!!url && url !== "" && url !== "http://") {
            if (url.substring(0,7) !== "http://") {
                url = "http://" + url;
            }
            restoreSelection(saved_selection);              // restore selection and apply link to it
            document.execCommand("unlink", false, null);    // removes previously existing link
            document.execCommand("createLink", false, url);
            clearAllSelections();
        }

        checkExistingLink();
    }

    /*
     * Make email link and backwards
     */
    function toggleEmailLink() {
        hideAllContextMenus();

        var saved_selection = saveSelection(); // Save selection for link. Fix for touch devices

        var stop = true;

        if (placeholder == "none") {
            placeholder = "";
        }

        while(stop) {
            var email = prompt("Please enter email link (e.g.: name@domain.co.uk)", placeholder);
            // If NOT null and NOT valid
            if(validateEmail(email)) {
                stop = false;
                restoreSelection(saved_selection);              // restore selection and apply link to it
                document.execCommand("unlink", false, null);    // removes previously existing link
                email = "mailto:" + email;
                document.execCommand("createLink", false, email);
                checkExistingLink();
                clearAllSelections();
            }
            if(!email && email !== "") {
                stop = false;
            }
        }
    }

    /*
     * Make Web link and backwards
     */
    function editLink() {
        hideAllContextMenus();

        var saved_selection = saveSelection(); // Save selection for link. Fix for touch devices
        var stop = true;
        
        while(stop) {
            var link = prompt("Please make changes to link:", placeholder);

            // If NOT null and NOT empty
            if(!!link && link !== "") {
                
                // If link doesn't start with "http://" and "mailto:"
                if ((link.substring(0,7) !== "http://") && (link.substring(0,7) !== "mailto:")) {
                    if (validateEmail(link)) { // Check if it is an email link
                        link = "mailto:" + link;
                    } else {
                        link = "http://" + link;
                    }
                    restoreSelection(saved_selection);              // restore selection and apply link to it
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                    clearAllSelections();
                } else {
                    placeholder = link;
                }

                // If link is an email
                if (link.substring(0,7) === "mailto:") {
                    link = link.substring(7, link.length);

                    if (validateEmail(link)) { // Check if it is an email link
                        link = "mailto:" + link;
                        restoreSelection(saved_selection);              // restore selection and apply link to it
                        document.execCommand("unlink", false, null);    // removes previously existing link
                        document.execCommand("createLink", false, link);

                        stop = false; // exit close prompt
                        clearAllSelections();
                    } else {
                        link = "mailto:" + link;
                        placeholder = link;
                    }
                }
                // If it is a link
                if (link.substring(0,7) === "http://") {
                    restoreSelection(saved_selection);              // restore selection and apply link to it
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                    clearAllSelections();
                } else {
                    placeholder = link;
                }
            }
            // Exit close prompt if CANCEL was pressed
            else {
                stop = false;
            }
        }
    }

    /*
     * Opens web link or email link
     */
    function openLink() {
        window.open(placeholder);
        return false;
    }

    /*
     * Accordingly changes color of selected text
     * @color defines color that will be applied
     */
    function setColor(color) {
        document.execCommand("foreColor", false, color);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Applies heading type for selection.
     * @heading_type - can be any type of heading (format: h1, h2...)
     */
    function toggleHeading(heading_type) {
        switch(heading_type)
        {
            case "h1":
                // Remove all previous formatting before apply new
                if (is_italic) {
                    document.execCommand("italic", false, null);
                    is_italic = false;
                }

                document.execCommand("fontSize", false, "5");
                break;

            case "h2":
                // Remove all previous formatting before apply new

                document.execCommand("fontSize", false, "5");
                document.execCommand("italic", false, null);
                is_italic = true;
                break;

            default:
                console.log("Heading type undefined");
        }

        content_elements[container_id].focus();          // return focus back to editing field
    }

    /*
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        document.execCommand("removeFormat", false, null);
        document.execCommand("unlink", false, null);

        content_elements[container_id].focus();          // return focus back to editing field
    }





//------------------------------------------
// Extra functionality
//------------------------------------------

    /*
     * Paste everything into editable div without HTML formatting.
     */
    var pastePlain = function(e) {
        e.preventDefault();
        
        // For damn IE
        if(isMSIE) {
            var text = window.clipboardData.getData("Text");  // get data from clipboard as plain text
            pasteHtmlAtCaret(text); // fix for unimplemented in IE 'execCommand("insertHTML")'
                                    // pasteHtmlAtCaret() taken from 'ie-pebble-text-editor.js' that is loaded conditionally
        }
        // For the rest of browsers
        else {
            var text = e.clipboardData.getData("text/plain"); // get data from clipboard as plain text
            document.execCommand("insertHTML", false, text);
        }
    }





//------------------------------------------
// App.Init
//------------------------------------------

    /*
     * This function was created due to the closure inside the loops
     */
    function setEventListener(content_elements, i) {
        var id = i; // make local variable to use the closure in the loop
        
        // Adding event listeners
        content_elements[i].addEventListener("paste",     pastePlain,    false); // Paste unformatted text

        content_elements[i].addEventListener("focus",     function(){
            // Ability to get selection. Fix for touch devices.
            timer = setInterval(positionTools, 150);

            if(sel_type==="Range"){ showTools(); }
        }, false);
        
        // Saves all data into textarea.
        // Hides editing tools when out of editing element focus.
        content_elements[i].addEventListener("blur",      function(e){ 
            clearInterval(timer); // Clears timer variable when not in use
            
            // Updates textarea for back-end submition
            updateTextarea(e, id);
            
            // Defines whether user selected text or not
            sel_type = checkSelectionType(window.getSelection());
            
            if(sel_type === "None" || sel_type === "Caret") { hideTools(); }
        }, false);

        // Place formatting tools
        document           .addEventListener("scroll",    function(){ if(sel_type === "Range") { positionTools; } }, false); // Show formatting tools when Scroll

        // Touch events
        content_elements[i].addEventListener("touchstart", function() { positionTools; }, false);
        content_elements[i].addEventListener("touchmove", function() { positionTools; }, false);
        content_elements[i].addEventListener("touchend",   function() { positionTools; }, false);
    }

    /*
     * Sets actions for all toolbar buttons
     */
    function setFormatTools() {
        // Fast click for all touch devices to fix 300ms delay on click
        var fastClickButtons = format_tools_div.getElementsByTagName("button"); // Array with all toolbar buttons
        
        for (var n=0; n < fastClickButtons.length; n++) { // Loop through every button and add it to FastClick object
            new FastClick(fastClickButtons[n]);
        }

        // Toolbar buttons and their actions
        formatTools["toggle-bold"]                 .addEventListener("click", toggleBold,   false);
        formatTools["toggle-italic"]               .addEventListener("click", toggleItalic, false);
        formatTools["toggle-color-menu"]           .addEventListener("click", toggleColorMenu, false);
            formatTools["color-red"]               .addEventListener("click", function(){ setColor("red") }, false);
            formatTools["color-green"]             .addEventListener("click", function(){ setColor("green") }, false);
            formatTools["color-blue"]              .addEventListener("click", function(){ setColor("blue") }, false);
            formatTools["back-main-from-color"]    .addEventListener("click", toggleColorMenu, false);

        formatTools["toggle-paragraph-menu"]       .addEventListener("click", toggleParagraphMenu, false);
            formatTools["toggle-heading-h1"]       .addEventListener("click", function(){ toggleHeading("h1"); }, false);
            formatTools["toggle-heading-h2"]       .addEventListener("click", function(){ toggleHeading("h2"); }, false);
            formatTools["back-main-from-paragraph"].addEventListener("click", toggleParagraphMenu, false);

        formatTools["toggle-web-link"]             .addEventListener("click", function(){ toggleWebLink(); }, false);
        formatTools["toggle-email-link"]           .addEventListener("click", function(){ toggleEmailLink(); }, false);
            formatTools["edit-link"]               .addEventListener("click", function(){ editLink(); }, false);
            formatTools["open-link"]               .addEventListener("click", function(){ openLink(); }, false);
        formatTools["remove-formatting"]           .addEventListener("click", function(){ removeFormatting(); }, false);
    }

    // Loop through each 'text editor content' element and add event listeners
    for(var i = 0; i < content_elements.length; i++) {
        setEventListener(content_elements, i);
    }
    setFormatTools();

})(window, document);