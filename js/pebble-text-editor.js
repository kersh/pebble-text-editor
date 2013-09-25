/* 
 * Pebble Text Editor 
 * v0.2
 * - Can make text bold and italic.
 * - Show/Hide the formatting tools.
 * - Paste data into textarea.
 * 
 * v0.1
 * - Initial version. Can only paste plain text.
 * - Detects which form is currently active.
 * 
 * Copyright 2013 - 2014 Pebble Learning
 */
(function(window, document, undefined){
//------------------------------------------
// All Variables defined here
//------------------------------------------
    // Helpers
    var sel_type          = "Caret";     // variable to store type of selection: caret or range
    var container_id      = 0;           // Needs to detect which container currently is edited
    var show_menu_class   = "show-menu"; // Class for making visible the context menus

    // All core elements
    var arrow_pointer     = document.getElementById("arrow-pointer");                // arrow icon that pointing on selection
    var content_elements  = document.getElementsByClassName("text-editor-content");  // set of core editor elements (editable divs)
    var textarea_elements = document.getElementsByClassName("text-editor-textarea"); // set of core editor elements (editable divs)
    var format_tools_div  = document.getElementById("tools");                        // div with formatting tools
    var color_menu        = document.getElementById("color-menu");                   // context menu that holds color pallete
    var paragraph_menu    = document.getElementById("paragraph-menu");               // context menu that holds heading/paragraph styles

    // List of tools for rich editing
    var formatTools = [];
    formatTools['toggle-bold']           = document.getElementById("toggle-bold");
    formatTools['toggle-italic']         = document.getElementById("toggle-italic");
    formatTools['toggle-color-menu']     = document.getElementById("toggle-color-menu");
        formatTools['color-red']         = document.getElementById("color-red");
        formatTools['color-green']       = document.getElementById("color-green");
        formatTools['color-blue']        = document.getElementById("color-blue");
    formatTools['toggle-paragraph-menu'] = document.getElementById("toggle-paragraph-menu");
        formatTools['toggle-heading-h1'] = document.getElementById("toggle-heading-h1");
        formatTools["toggle-heading-h2"] = document.getElementById("toggle-heading-h2");
    formatTools['toggle-web-link']       = document.getElementById("toggle-web-link");
    formatTools['toggle-email-link']     = document.getElementById("toggle-email-link");
    formatTools["remove-formatting"]     = document.getElementById("remove-formatting");





//------------------------------------------
// Helper functions
//------------------------------------------

    //
    // Checks if element has particular class
    //
    function hasClass(element, class_name) {
        return element.className.match(new RegExp('(\\s|^)' + class_name + '(\\s|$)'));
    }

    //
    // Adds class/classes to an element
    //
    function addClass(element, class_name) {
        if (!hasClass(element, class_name)) { element.className += " " + class_name; }
    }

    //
    // Removes class/classes from an element
    //
    function removeClass(element, class_name) {
        if (hasClass(element, class_name)) {
            var regexp = new RegExp('(\\s|^)' + class_name + '(\\s|$)');
            element.className = element.className.replace(regexp, '');
        }
    }

    //
    // Saves user's text selection // NOT USED YET
    //
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

    //
    // Restores saved user's text selection // NOT USED YET
    //
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

    //
    // Hide context menu
    // @name_of_menu this is element which should be hidden (e.g. color_menu, paragraph_menu)
    // @button_id this is id of button that toggles this context menu (e.g. toggle-color-menu, toggle-paragraph-menu)
    //
    function hideContextMenu(name_of_menu, button_id) {
        removeClass(name_of_menu, show_menu_class);
        removeClass(button_id, "is-selected");
    }

    //
    // Show context menu
    // @name_of_menu this is element which should be visible (e.g. color_menu, paragraph_menu)
    // @button_id this is id of button that toggles this context menu (e.g. toggle-color-menu, toggle-paragraph-menu)
    //
    function showContextMenu(name_of_menu, button_id) {
        addClass(name_of_menu, show_menu_class);
        addClass(button_id, "is-selected");
    }

    //
    // Hide all open context menus at the same time
    //
    function hideAllContextMenus() {
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]);          // hide color menu
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);  // hide paragraph menu
    }






//------------------------------------------
// Editor core functions
//------------------------------------------

    //
    // Update textarea.
    // This function saves everything from editable div into <textarea> to make it easy to submit data to back-end.
    // 
    // @evt event object
    // @id the id of editable div in a DOM tree
    //
    function updateTextarea(evt, id) {
        container_id = id;
        var div_content = evt.target.innerHTML;        // save contents from current editable div to a variable
        textarea_elements[id].value = div_content;     // copy content from editable div into right textarea
    }

    //
    // Show formatting tools
    //
    // @top defines coordinates of bottom line of selection
    // @left defines starting point of selection from left side
    //
    function showTools(top, left) {
        format_tools_div.style.top = top + "px";       // Locate tools
        format_tools_div.style.left = left + "px";     // below the selection
        addClass(format_tools_div, "show-tools");      // Adding class to make tools visible
    }

    //
    // Hide formatting tools
    //
    function hideTools() {
        removeClass(format_tools_div, "show-tools");   // Removes class to hide tools
        
        // Hide all context menus
        hideAllContextMenus();
    }

    //
    // Checks if user selected something or not.
    //
    // @selection
    // @return "Caret" or "Range" accordingly
    //
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

    //
    // Function that defines position of formatting tools on the screen.
    // It finds the position of selected range and places toolbox next to that.
    //
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

            // Place tools in right place
            showTools(oRect.top + sel_height, oRect.left);
        }
        // Hide tools when not used
        else {
            hideTools();
        }
    }

    //
    // Show/Hide color menu
    //
    function toggleColorMenu() {
        // Close other menus
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);

        // Toggle menu with colors
        if(hasClass(color_menu, show_menu_class)) {
            hideContextMenu(color_menu, formatTools["toggle-color-menu"]);
        } else {
            showContextMenu(color_menu, formatTools["toggle-color-menu"]);
            content_elements[container_id].focus(); // return focus back to editing field
        }
    }

    //
    // Show/Hide color menu
    //
    function toggleParagraphMenu() {
        // close other menus
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]);

        // Toggle menu with heading/paragraph styles
        if(hasClass(paragraph_menu, show_menu_class)) {
            hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);
        } else {
            showContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);
            content_elements[container_id].focus(); // return focus back to editing field
        }
    }






//------------------------------------------
// Formatting tools functions
//------------------------------------------

    //
    // Make text bold and backwards
    //
    function toggleBold() {
        hideAllContextMenus();
        document.execCommand("bold", false, null);
        content_elements[container_id].focus();         // return focus back to editing field
    }

    //
    // Make text italic and backwards
    //
    function toggleItalic() {
        hideAllContextMenus();
        document.execCommand("italic", false, null);
        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make Web link and backwards
     */
    function toggleWebLink() {
        hideAllContextMenus();
        document.execCommand("unlink", false, null);    // removes previously existing link

        var url = prompt("Please enter web link (e.g.: http://www.domain.co.uk)","http://");
        if(!!url && url.substring(0,7) !== "http://") {
            url = "http://" + url;
        }
        document.execCommand("createLink", false, url);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make email link and backwards
     */
    function toggleEmailLink() {
        hideAllContextMenus();
        document.execCommand("unlink", false, null);    // removes previously existing link

        var email = prompt("Please enter email link (e.g.: name@domain.co.uk)","");
        email = "mailto:" + email;
        document.execCommand("createLink", false, email);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    //
    // Accordingly changes color of selected text
    // @color defines color that will be applied
    //
    function setColor(color) {
        document.execCommand("foreColor", false, color);
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]); // close color menu when done

        content_elements[container_id].focus();         // return focus back to editing field
    }


    function toggleHeading(heading_type) {
        switch(heading_type)
        {
            case "h1":
                document.execCommand("fontSize", false, "5");
                break;

            case "h2":
                document.execCommand("fontSize", false, "5");
                document.execCommand("italic", false, null);
                break;

            default:
                console.log("Heading type undefined");
        }
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]); // close color menu when done

        content_elements[container_id].focus();          // return focus back to editing field
    }

    function removeFormatting() {
        hideAllContextMenus();
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

        content_elements[i].addEventListener("focus",     function(e){
            if(sel_type==="Range"){ showTools(); }
        }, false);
        
        // Saves all data into textarea.
        // Hides editing tools when out of editing element focus
        content_elements[i].addEventListener("blur",      function(e){ 
            updateTextarea(e, id);
            
            var selection = window.getSelection();
            sel_type = checkSelectionType(selection);      // defines whether user selected text or not
            if(sel_type === "None" || sel_type === "Caret") { hideTools(); }
        }, false);

        // Place formatting tools
        content_elements[i].addEventListener("mousemove", positionTools, false); // React on mouse move. Remove this if performance will be low.
        content_elements[i].addEventListener("mouseup",   positionTools, false); // Show formatting tools when SELECTED with MOUSE
        content_elements[i].addEventListener("keyup",     positionTools, false); // Show formatting tools when SELECTED with KEYBOARD
        document           .addEventListener("scroll",    function(){
            if(sel_type === "Range") {
                positionTools();
            }
        }, false); // Show formatting tools when Scroll

        // Touch events
        content_elements[i].addEventListener("touchmove", positionTools, false); // React on mouse move. Remove this if performance will be low.
        content_elements[i].addEventListener("touchend",   positionTools, false); // Show formatting tools when SELECTED with MOUSE
    }

    function setFormatTools() {
        // Formatting tools
        formatTools["toggle-bold"]          .addEventListener("click", toggleBold,   false);
        formatTools["toggle-italic"]        .addEventListener("click", toggleItalic, false);
        formatTools["toggle-color-menu"]    .addEventListener("click", toggleColorMenu, false);
        formatTools["color-red"]            .addEventListener("click", function(){ setColor("red") }, false);
        formatTools["color-green"]          .addEventListener("click", function(){ setColor("green") }, false);
        formatTools["color-blue"]           .addEventListener("click", function(){ setColor("blue") }, false);

        formatTools["toggle-paragraph-menu"].addEventListener("click", toggleParagraphMenu, false);
        formatTools["toggle-heading-h1"]    .addEventListener("click", function(){ toggleHeading("h1"); }, false);
        formatTools["toggle-heading-h2"]    .addEventListener("click", function(){ toggleHeading("h2"); }, false);
        
        formatTools["toggle-web-link"]      .addEventListener("click", function(){ toggleWebLink(); }, false);
        formatTools["toggle-email-link"]    .addEventListener("click", function(){ toggleEmailLink(); }, false);
        formatTools["remove-formatting"]    .addEventListener("click", function(){ removeFormatting(); }, false);
    }


    // Loop through each 'text editor content' element and add event listeners
    for(var i = 0; i < content_elements.length; i++) {
        setEventListener(content_elements, i);
    }
    setFormatTools();

})(window, document);