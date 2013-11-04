/* 
 * Pebble Text Editor
 * Copyright @ Pebble Learning
 */
;




(function(window, document, undefined){ // ============ DESKTOP
//------------------------------------------
// All variables defined here
//------------------------------------------

    // Helpers
    var sel_type          = "Caret";     // Variable to store type of selection: caret or range
    var container_id      = 0;           // Needs to detect which container currently is edited
    var show_menu_class   = "show-menu"; // Class for making visible the context menus
    var is_in_focus       = false;       // Make editing tools working only inside input that is in focus
    var is_italic         = false;       // Variable for removing extra formatting from any of paragraphs
    var placeholder       = "none";      // Is a placeholder for input field when create a web/email link

    // All core elements
    var arrow_pointer     = document.getElementById("arrow-pointer");                // arrow icon that pointing on selection
    var content_elements  = document.getElementsByClassName("text-editor-content");  // set of core editor elements (editable divs)
    var textarea_elements = document.getElementsByClassName("text-editor-textarea"); // set of core editor elements (editable divs)
    var format_tools_div  = document.getElementById("toolbar");                      // div with formatting tool
    var main_menu         = document.getElementById("main-menu");                    // main menu
    var color_menu        = document.getElementById("color-menu");                   // context menu that holds color pallete
    var paragraph_menu    = document.getElementById("paragraph-menu");               // context menu that holds heading/paragraph styles
    var buttons_wrapper   = document.getElementById("buttons-container");            // all button holder

    var section_container = document.getElementsByClassName("text-area-holder");     // section container
    var media_container   = document.getElementsByClassName("media-container");      // media container
    var add_section_above = document.getElementsByClassName("add-above");
    var add_section_below = document.getElementsByClassName("add-below");



    // List of tools for rich editing
    var formatTools = [];
    formatTools['toggle-bold']                   = document.getElementById("toggle-bold");
    formatTools['toggle-italic']                 = document.getElementById("toggle-italic");

    formatTools['toggle-color-menu']             = document.getElementById("toggle-color-menu");
        formatTools['color-red']                 = document.getElementById("color-red");
        formatTools['color-green']               = document.getElementById("color-green");
        formatTools['color-blue']                = document.getElementById("color-blue");
    
    formatTools['toggle-paragraph-menu']         = document.getElementById("toggle-paragraph-menu");
        formatTools['toggle-heading-h1']         = document.getElementById("toggle-heading-h1");
        formatTools["toggle-heading-h2"]         = document.getElementById("toggle-heading-h2");
    
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
     * Saves user's text selection // NOT USED YET
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
     * Restores saved user's text selection // NOT USED YET
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
     * Hide context menu
     *
     * @name_of_menu this is element which should be hidden (e.g. color_menu, paragraph_menu)
     * @button_id this is id of button that toggles this context menu (e.g. toggle-color-menu, toggle-paragraph-menu)
     */
    function hideContextMenu(name_of_menu, button_id) {
        removeClass(name_of_menu, show_menu_class);
        removeClass(button_id, "is-selected");
    }

    /*
     * Show context menu
     *
     * @name_of_menu this is element which should be visible (e.g. color_menu, paragraph_menu)
     * @button_id this is id of button that toggles this context menu (e.g. toggle-color-menu, toggle-paragraph-menu)
     */
    function showContextMenu(name_of_menu, button_id) {
        addClass(name_of_menu, show_menu_class);
        addClass(button_id, "is-selected");
    }

    /*
     * Hide all open context menus at the same time
     */
    function hideAllContextMenus() {
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]);          // hide color menu
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);  // hide paragraph menu
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
            if (selected_link.substring(0,24) === "javascript:window.open('") {
                selected_link = selected_link.substring(24, selected_link.length-2);
            }
            placeholder = selected_link;
            addClass(main_menu, "is-link");
        } else {
            placeholder = "none";
            removeClass(main_menu, "is-link");
        }

        return selected_link;
    }

    /*
     * Function that defines position of formatting tools on the screen.
     * It finds the position of selected range and places toolbox next to that.
     */
    var positionTools = function() {
        var oRange, oRect, selection, sel_width, sel_height, current_bottom_distance;
        var min_bottom_distance = 140;
        var tools_height = 32;

        selection = window.getSelection();
        sel_type = checkSelectionType(selection); // defines whether user selected text or not

        // Show formatting tools if user selected anything
        if(sel_type === "Range") {
            // Define position of selection
            oRange = selection.getRangeAt(0);
            oRect = oRange.getBoundingClientRect();

            removeUnderline(selection);

            // Height and width of selecion
            sel_height = oRect.bottom - oRect.top;
            sel_width = oRect.right - oRect.left;

            // Current distance from selection to bottom
            current_bottom_distance = window.innerHeight - oRect.bottom;
            
            // Moves arrow pointer in the middle of selection
            if(sel_width > 10) {
                sel_width = (sel_width - 10) / 2;
                arrow_pointer.style.marginLeft = sel_width + "px";
            }
            else {
                arrow_pointer.style.marginLeft = "0px";
            }

            // Check if web link or email link currently selected to show different menu
            checkExistingLink();


            // Show tools normally before user riches bottom side of the browser
            if (current_bottom_distance > min_bottom_distance) {
                format_tools_div.insertBefore(arrow_pointer, buttons_wrapper); // put arrow pointer on top
                removeClass(color_menu, "located-reverse");
                removeClass(paragraph_menu, "located-reverse");
                removeClass(arrow_pointer, "arrow-pointer-bottom");

                showTools(oRect.top + sel_height, oRect.left); // place tools below selection
            }
            // Reverse tools, when rich bottom side of the browser
            else {
                format_tools_div.appendChild(arrow_pointer);
                addClass(color_menu, "located-reverse");
                addClass(paragraph_menu, "located-reverse");
                addClass(arrow_pointer, "arrow-pointer-bottom");
                
                showTools(oRect.top - tools_height, oRect.left); // place tools above selection
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
     * Removes underline because we doesn't allow underline in our project
     */
    function removeUnderline(selection) {
        if (document.queryCommandState) {
            if (!checkExistingLink()) {
                if (document.queryCommandState("underline")) {
                    document.execCommand("underline", false, null);
                } // END if selection underlined
            } // END if selection is not a link
        } // END if queryCommandState is supported
    }

    /*
     * Make text bold and backwards
     */
    function toggleBold() {
        hideAllContextMenus();

        document.execCommand("bold", false, null);

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make text italic and backwards
     */
    function toggleItalic() {
        hideAllContextMenus();

        document.execCommand("italic", false, null);
        
        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleColorMenu() {
        // Close other menus.
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]); // close paragraph menu

        if(hasClass(color_menu, show_menu_class)) {
            hideContextMenu(color_menu, formatTools["toggle-color-menu"]);
        } else {
            showContextMenu(color_menu, formatTools["toggle-color-menu"]);
        }
        
        content_elements[container_id].focus(); // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleParagraphMenu() {
        // Close other menus
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]); // close color menu

        // Toggle menu with heading/paragraph styles
        if(hasClass(paragraph_menu, show_menu_class)) {
            hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);
        } else {
            showContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]);
        }
        
        content_elements[container_id].focus(); // return focus back to editing field
    }

    /*
     * Make Web link and backwards
     */
    function createWebLink() {
        hideAllContextMenus();

        if (placeholder == "none") {
            placeholder = "http://";
        }

        var url = prompt("Please enter web link (e.g.: http://www.domain.co.uk)", placeholder);
        // If NOT null and NOT empty
        if(!!url && url !== "" && url !== "http://") {
            if (url.substring(0,7) !== "http://") {
                url = "http://" + url;
            }
            url = "javascript:window.open('" + url + "')";
            document.execCommand("unlink", false, null);    // removes previously existing link
            document.execCommand("createLink", false, url);
            checkExistingLink();
        }

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make email link and backwards
     */
    function createEmailLink() {
        hideAllContextMenus();

        var stop = true;

        if (placeholder == "none") {
            placeholder = "";
        }

        while(stop) {
            var email = prompt("Please enter email link (e.g.: name@domain.co.uk)", placeholder);
            // If NOT null and NOT valid
            if(validateEmail(email)) {
                stop = false;
                document.execCommand("unlink", false, null);    // removes previously existing link
                email = "mailto:" + email;
                email = "javascript:window.open('" + email + "')";
                document.execCommand("createLink", false, email);
                checkExistingLink();
            }
            if(!email && email !== "") {
                stop = false;
            }
        }

        content_elements[container_id].focus();         // return focus back to editing field
    }

    /*
     * Make Web link and backwards
     */
    function editLink() {
        hideAllContextMenus();

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
                    
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                } else {
                    placeholder = link;
                }

                // If link is an email
                if (link.substring(0,7) === "mailto:") {
                    link = link.substring(7, link.length);

                    if (validateEmail(link)) { // Check if it is an email link
                        link = "mailto:" + link;
                        document.execCommand("unlink", false, null);    // removes previously existing link
                        document.execCommand("createLink", false, link);

                        stop = false; // exit close prompt
                    } else {
                        link = "mailto:" + link;
                        placeholder = link;
                    }
                }
                // If it is a link
                if (link.substring(0,7) === "http://") {
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                } else {
                    placeholder = link;
                }
            }
            // Exit close prompt if CANCEL was pressed
            else {
                stop = false;
            }
        }

        content_elements[container_id].focus();         // return focus back to editing field
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
        hideContextMenu(color_menu, formatTools["toggle-color-menu"]); // close color menu when done

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
        hideContextMenu(paragraph_menu, formatTools["toggle-paragraph-menu"]); // close color menu when done

        content_elements[container_id].focus();          // return focus back to editing field
    }

    /*
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        console.log("removeFormatting");
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
    var makePlain = function(e) {
        if (e.type === "paste") { // if user pasted data
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

        if (e.type === "drop") { // if data was dragged and then dropped
            /*
             * FIX THAT LATER. DOES WORK ONLY IN CHROME THUS I SWITCHED DRAG'n'DROP OFF.
             */
            e.preventDefault();

            // For damn IE
            // if(isMSIE) {
            //     var text = e.dataTransfer.getData("Text"); // get data from drag as plain text

            //     setTimeout(function() { // actions after drop event need to be delayed
            //         pasteHtmlAtCaret(text); // fix for unimplemented in IE 'execCommand("insertHTML")'
            //                                 // pasteHtmlAtCaret() taken from 'ie-pebble-text-editor.js' that is loaded conditionally
            //         hideTools();
            //     }, 0);
            // }
            // // For the rest of browsers
            // else {
            //     var text = e.dataTransfer.getData("text/plain"); // get data from drag as plain text
            //     setTimeout(function() { // actions after drop event need to be delayed
            //         document.execCommand("insertHTML", false, text);
            //         hideTools();
            //     }, 0);
            // }
        }
    }





//------------------------------------------
// Events
//------------------------------------------

    /*
     * Event for aligning media within section
     */
    function alignMedia() {
        var elem = this.parentNode.parentNode;
        var value = window.getComputedStyle(elem, null).getPropertyValue("float");

        if (value == "right") {
            elem.style.display = "none";
            elem.style.float = "left";
            this.innerHTML = "Right";

            setTimeout( function(){
                elem.style.display = "";
            }, 150);
        } else {
            elem.style.display = "none";
            elem.style.float = "right";
            this.innerHTML = "Left";

            setTimeout( function(){
                elem.style.display = "";
            }, 150);
        }
    }

    /*
     * Event for removing media from section
     */
    function removeMedia() {
        var result = confirm("Are sure? Do you want to remove media?");

        if (result == true) {
            this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        } else {
            false;
        }
    }
    
    /*
     * Sets all event listeners for media container elements
     * el - elements or set of elements
     */
    function setEventsForMediaContainer(el) {
        // Check if it's single element and convert it to array
        if (!el.length) {
            var elem = {};
            Array.prototype.push.call(elem, el);
            el = elem;
        }

        for (var i=0; el[i] !== undefined; i++) {
            // Add event listener for "Align media" button
            el[i].getElementsByClassName("align-media")[0].onclick = alignMedia;

            // Add event listener for "Remove media" button
            el[i].getElementsByClassName("remove-media")[0].onclick = removeMedia;
        }
    }

    /*
     * Event for removing section
     */
    function removeSection() {
        var elem = this.parentNode.parentNode.parentNode;
        var result = confirm("Are sure? Do you want to section?");

        if (result == true) {
            elem.parentNode.removeChild(elem);
        } else {
            false;
        }
    }

    /*
     * Event to toggle "Add media" menu
     */
    function toggleMediaMenu() {
        var el = this.parentNode.getElementsByClassName("align-media-choice")[0];

        if (hasClass(el, "show")) {
            removeClass(el, "show");
        } else {
            addClass(el, "show");
        }
    }

    /*
     * Event for adding new media into section
     * float - can be "left"/"right"
     */
    function addMedia(e, float) {
        var btn_value = "Left";
        var parent_el = e.target.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("editor-content-wrapper")[0]; // parent element
        var first_child_el = parent_el.firstChild; // first child element

        var media_div = document.createElement("div"); // main media container
        media_div.className = "media-container";
        media_div.style.float = float;
        if (float == "left") {
            btn_value = "Right";
        }
        media_div.innerHTML = '<div class="media-options"><button class="align-media">'+btn_value+'</button><button class="replace-media">Replace</button><button class="remove-media">Remove</button></div><!-- /.media-options --><img src="img/cat2.jpg" alt="cat"/>';

        parent_el.insertBefore(media_div, first_child_el); // insert new created container into section
        setEventsForMediaContainer(media_div);             // add all necessary event listeners

        removeClass(e.target.parentNode, "show");
    }
    
    /*
     * Sets all event listeners for section elements and section itself
     * el - elements or set of elements
     */
    function setEventsForSection(el) {
        // Check if it's single element and convert it to array
        if (!el.length) {
            var elem = {};
            Array.prototype.push.call(elem, el);
            el = elem;
        }

        for (var i = 0; el[i] !== undefined; i++) {
            // Event listener to remove section
            el[i].getElementsByClassName("remove-section")[0].onclick = removeSection;

            // Event to toggle "Add media" menu
            el[i].getElementsByClassName("add-media")[0].onclick = toggleMediaMenu;

            // Event to insert media into section
            el[i].getElementsByClassName("add-media-left")[0].onclick = function(e) { addMedia(e, "left"); }
            el[i].getElementsByClassName("add-media-right")[0].onclick = function(e) { addMedia(e, "right"); }
        }
    }

    /*
     * Sets event listener for "Add new section" buttons
     */
    function addSection(e, location) {
        console.log("addSection:", location);
        console.log("this:", e.target);
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
        content_elements[i].addEventListener("paste",     makePlain,    false); // Paste unformatted text

        content_elements[i].addEventListener("drop",      makePlain,    false); // Drops unformatted text

        content_elements[i].addEventListener("focus",     function(){
            is_in_focus = true; // got the focus

            addClass(this.parentNode.parentNode, "hover"); // add .hover for main container when in focus

            if(sel_type==="Range"){ showTools(); }

        }, false);
        
        // Saves all data into textarea.
        // Hides editing tools when out of editing element focus.
        content_elements[i].addEventListener("blur",      function(e){
            is_in_focus = false; // Lost the focus
            
            removeClass(this.parentNode.parentNode, "hover"); // remove .hover for main container when in blur

            // Updates textarea for back-end submition
            updateTextarea(e, id);

            // Defines whether user selected text or not
            sel_type = checkSelectionType(window.getSelection());

            if(sel_type === "None" || sel_type === "Caret") { hideTools(); }
        }, false);

        // Place formatting tools
        content_elements[i].addEventListener("mousemove", function() {           // React on mouse move. Remove this if performance will be low
            if(is_in_focus === true) { positionTools(); }
        }, false);
        format_tools_div.addEventListener("mousemove", function() {           // React on mouse move. Remove this if performance will be low
            if(is_in_focus === true) { positionTools(); }
        }, false);

        content_elements[i].addEventListener("mouseup",   positionTools, false); // Show formatting tools when SELECTED with MOUSE
        content_elements[i].addEventListener("keyup",     positionTools, false); // Show formatting tools when SELECTED with KEYBOARD
        document           .addEventListener("scroll",    function() {           // Show formatting tools when Scroll and move with the content
            if(sel_type === "Range") { positionTools(); }
        }, false);
    }

    // Add all events after initiall run
    setEventsForMediaContainer(media_container);
    setEventsForSection(section_container);

    /*
     * Sets actions for all toolbar buttons
     */
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
        
        formatTools["toggle-web-link"]      .addEventListener("click", function(){ createWebLink(); }, false);
        formatTools["toggle-email-link"]    .addEventListener("click", function(){ createEmailLink(); }, false);
            formatTools["edit-link"]        .addEventListener("click", function(){ editLink(); }, false);
            formatTools["open-link"]        .addEventListener("click", function(){ openLink(); }, false);

        formatTools["remove-formatting"]    .addEventListener("click", function(){ removeFormatting(); }, false);
    }

    // Loop through each 'text editor content' element and add event listeners
    for(var i = 0; i < content_elements.length; i++) {
        setEventListener(content_elements, i);
    }
    setFormatTools();

    // Set event listeners for "Add new section"
    for(var i = 0; i < add_section_above.length; i++) {
        add_section_above[i].onclick = function(e) { addSection(e, "above"); }
        add_section_below[i].onclick = function(e) { addSection(e, "below"); }
    }

})(window, document);