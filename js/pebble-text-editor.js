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
    var elem_amount       = 0;           // Amount of core elemnts on the page
    var sel_type          = "Caret";     // Variable to store type of selection: caret or range
    var current_el_id     = 0;           // Needs to detect which container currently is edited
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

    var rmv_add_section_menu,
        add_new_section_menu,
        btn_add_txt_sect,
        btn_add_media_sect,
        btn_add_tbl_sect;

    var cur_mouse_x, cur_mouse_y;



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
     * Sets unique id for every element
     */
    function setID(id) {
        current_el_id = id;
    }

    /*
     * Update textarea.
     * This function saves everything from editable div into <textarea> to make it easy to submit data to back-end.
     * 
     * @evt event object
     * @id the id of editable div in a DOM tree
     */
    function updateTextarea(cur_el) {
        var div_content = cur_el.innerHTML;        // save contents from current editable div to a variable
        textarea_elements[current_el_id].value = div_content;     // copy content from editable div into right textarea
        console.log("current_el_id:", current_el_id);
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

        content_elements[current_el_id].focus();         // return focus back to editing field
    }

    /*
     * Make text italic and backwards
     */
    function toggleItalic() {
        hideAllContextMenus();

        document.execCommand("italic", false, null);
        
        content_elements[current_el_id].focus();         // return focus back to editing field
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
        
        content_elements[current_el_id].focus(); // return focus back to editing field
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
        
        content_elements[current_el_id].focus(); // return focus back to editing field
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

        content_elements[current_el_id].focus();         // return focus back to editing field
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

        content_elements[current_el_id].focus();         // return focus back to editing field
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

        content_elements[current_el_id].focus();         // return focus back to editing field
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

        content_elements[current_el_id].focus();         // return focus back to editing field
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

        content_elements[current_el_id].focus();          // return focus back to editing field
    }

    /*
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        hideAllContextMenus();

        document.execCommand("removeFormat", false, null);
        document.execCommand("unlink", false, null);

        console.log("id:", current_el_id);
        content_elements[current_el_id].focus();          // return focus back to editing field
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

    function calculateResize(e, direction, media_el) {
        var dist_x, dist_y, sum, cur_width, pows, diagonal,
            ratio = 0.05;

        cur_width = parseFloat(media_el.style.getPropertyValue("width").replace("%",""));

        // Direction: to top right corner (-> ^)
        if (direction == "left") {
            dist_x   = e.x - cur_mouse_x;
            dist_y   = cur_mouse_y - e.y;
            sum      = dist_x + dist_y;
            pows     = Math.pow(dist_x, 2) + Math.pow(dist_y, 2);
            diagonal = Math.sqrt(pows);
        }
        // Direction: left top corner
        else {
            dist_x   = cur_mouse_x - e.x;
            dist_y   = cur_mouse_y - e.y;
            sum      = dist_x + dist_y;
            pows     = Math.pow(dist_x, 2) + Math.pow(dist_y, 2);
            diagonal = Math.sqrt(pows);
            // console.log("sum:", sum);
        }

        // console.log("pows:", pows);
        // console.log("sum:", sum);
        ratio = diagonal * 0.2;
        // make image smaller
        if (sum > 0) {
            if (cur_width > 20) { // set minimum limit
                cur_width = cur_width - ratio;
                media_el.style.width = cur_width + "%";
            }
        }
        // make image bigger
        else {
            if (cur_width < 99) { // set maximum limit
                cur_width = cur_width + ratio;
                media_el.style.width = cur_width + "%";
            }
        }

        cur_mouse_x = e.x;
        cur_mouse_y = e.y;

        return false;
    }

    /*
     * Resize image width in % accordingly to user actions
     */
    function resizeImg(e, this_el, media_el, direction) {
        var cur_width;

        // disable selestion on drag
        document.onselectstart = function(){ return false; }
        
        // set current mouse location
        cur_mouse_x = e.x;
        cur_mouse_y = e.y;

        // keep cursor changed
        if (direction == "left") {
            addClass(document.body, "ne-resize");
        } else {
            addClass(document.body, "nw-resize");
        }

        // run function to calculate and resize image
        document.onmousemove = function(e) { calculateResize(e, direction, media_el) };

        // remove event listener
        document.onmouseup  = function() {
            removeClass(document.body, "ne-resize");
            removeClass(document.body, "nw-resize");

            cur_width = parseFloat(media_el.style.getPropertyValue("width").replace("%",""));
            // Check if image is oversized
            if (cur_width > 99) {
                media_el.style.width = 99 + "%";
            }
            // Check if media is smaller than minimum limit
            if (cur_width < 20) {
                media_el.style.width = 20 + "%";
            }
            document.onmousemove = function() {
                // Reset all values
                cur_mouse_x = 0;
                cur_mouse_y = 0;
            };

            document.onselectstart = function(){ return true; }
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

            el[i].getElementsByClassName("resize-img-left-bot")[0].onmousedown  = function(e) { resizeImg(e, this, this.parentNode.parentNode, "left") };
            // el[i].getElementsByClassName("resize-img-left-bot")[0].onmouseup    = function(e) { this.onmousemove = null; }; // remove event listener

            el[i].getElementsByClassName("resize-img-right-bot")[0].onmousedown = function(e) { resizeImg(e, this, this.parentNode.parentNode, "right") };
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
     * Move section up or down
     */
    function moveSection(e, direction) {
        var el = e.target.parentNode.parentNode.parentNode,
            par_el = el.parentNode,
            ref_el;
        
        if (direction == "up") {
            // console.log("up was hit");
            ref_el = prev(el);

            if (ref_el !== null) {
                par_el.insertBefore(el, ref_el);
            }
        }
        else {
            // console.log("down was hit");
            ref_el = next(el);

            if (ref_el !== null) {
                // console.log("ref_el:", ref_el);
                par_el.insertBefore(ref_el, el);
            }
        }
        
    }

    /*
     *  Finds previous element of same kind in a DOM
     */
    function prev(el) {
        var prev_el = el.previousSibling,
            check   = true;

        while(check) {
            // If object exists do below
            if (!!prev_el) {
                if (prev_el.nodeType == 1) { // if node type match to <div> then check for class
                    if (!hasClass(prev_el, el.className)) { // check if class matches to section class
                        prev_el = prev_el.previousSibling;
                    }
                    else { // previous sibling was found, Exit loop
                        check = false;
                    }
                }
                else { // shift to next element if previous wasn't <div>
                    prev_el = prev_el.previousSibling;
                }
            }
            // Exit loop if object is undefined
            else {
                check = false;
            }
        } // end while

        return prev_el;
    }

    /*
     *  Finds next element of same kind in a DOM
     */
    function next(el) {
        var next_el = el.nextSibling,
            check   = true;

        while(check) {
            // If object exists do below
            if (!!next_el) {
                if (next_el.nodeType == 1) { // if node type match to <div> then check for class
                    if (!hasClass(next_el, el.className)) { // check if class matches to section class
                        next_el = next_el.nextSibling;
                    }
                    else { // previous sibling was found, Exit loop
                        check = false;
                    }
                }
                else { // shift to next element if previous wasn't <div>
                    next_el = next_el.nextSibling;
                }
            }
            // Exit loop if object is undefined
            else {
                check = false;
            }
        } // end while

        return next_el;
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
        media_div.style.width = "30%"; // default width
        if (float == "left") {
            btn_value = "Right";
        }
        media_div.innerHTML = '<div class="media-options"><button class="align-media">'+btn_value+'</button><button class="replace-media">Replace</button><button class="remove-media">Remove</button><div class="resize-img-left-bot"></div><div class="resize-img-right-bot"></div></div><!-- /.media-options --><img src="img/cat2.jpg" alt="cat"/>';

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
     * "Add new section" buttons aka "Pluses"(+)
     */
    function addNewSectionMenu(e, location) {
        var par_el, ref_el,
            add_new_el = document.createElement("div");
            add_new_el.id = "add-new-section-menu";
            add_new_el.className = "add-new-section-menu";
            add_new_el.innerHTML = '<button id="add-text-section"><div class="icon">+</div><div class="lbl">Text Section</div></button>'
                                 + '<button id="add-media-section"><div class="icon">+</div><div class="lbl">Media Section</div></button>'
                                 + '<button id="add-tbl-section"><div class="icon">+</div><div class="lbl">Table Section</div></button>'
                                 + '<button id="remove-add-section-menu">✖</button>';
        
        add_new_section_menu = document.getElementById("add-new-section-menu");

        // Remove menu if it already exists
        if (!!add_new_section_menu) { removeAddSectionMenu(); }

        if (location === "above") {
            par_el = e.target.parentNode.parentNode;
            ref_el = e.target.parentNode;
            par_el.insertBefore(add_new_el, ref_el);
        } else {
            par_el = e.target.parentNode.parentNode.parentNode;
            ref_el = e.target.parentNode.parentNode;
            par_el.insertBefore(add_new_el, ref_el.nextSibling);
        }

        setTimeout(function() {
            addClass(add_new_el, "show");
        }, 0);
        // Set focus
        document.getElementById("add-text-section").focus();

        // Add event listeners for new "Add new section" menu.
        setEventsForAddNewSection();
    }

    /*
     * Add txt section to DOM
     */
    function addTxtSection() {
        var par_el = add_new_section_menu.parentNode,
            ref_el = add_new_section_menu,
            section_el = document.createElement("div");
            section_el.className = "text-area-holder group";
            section_el.innerHTML = '<button class="add-btn add-above">+</button>'
                                 + '<div class="editor-content-wrapper">'
                                 + '<div class="text-editor-content" contenteditable></div><!-- /.text-editor-content -->'
                                 + '</div><!-- /.editor-content-wrapper -->'
                                 + '<textarea name="text-editor-textarea" class="text-editor-textarea"></textarea>'
                                 + '<div class="section-options">'
                                 + '<div class="core-options-holder">'
                                 + '<button class="remove-section">✖ Remove</button>'
                                 + '<button class="move-sec-up">Up</button>'
                                 + '<button class="move-sec-down">Dw</button>'
                                 + '<button class="add-media">Add Media</button>'
                                 + '<div class="align-media-choice">'
                                 + '<button class="add-media-left">Left</button>'
                                 + '<button class="add-media-right">Right</button>'
                                 + '</div><!-- /.align-media-choice -->'
                                 + '</div><!-- /.core-options-holder -->'
                                 + '<button class="add-btn add-below">+</button>'
                                 + '</div><!-- /.section-options -->';
        
        ref_el.style.display = "none";

        par_el.insertBefore(section_el, ref_el);
        setCoreElementEventListener(section_el); // add event listeners
        section_el.getElementsByClassName("text-editor-content")[0].focus();
        
        removeAddSectionMenu();
    }

    /*
     * Add media only section to DOM
     */
    function addMediaSection() {
        console.log("add media section");
    }

    /*
     * Add table section to DOM
     */
    function addTblSection() {
        console.log("add tbl section");
    }

    /*
     * Removes "Add new section" menu from DOM
     */
    function removeAddSectionMenu() {
        removeClass(add_new_section_menu, "show");
        add_new_section_menu.parentNode.removeChild(add_new_section_menu);
    }

    /*
     * Sets all events for "Add new section" menu
     */
    function setEventsForAddNewSection() {
        add_new_section_menu = document.getElementById("add-new-section-menu");
        
        if (!!add_new_section_menu) {
            btn_add_txt_sect     = document.getElementById("add-text-section");
            btn_add_media_sect   = document.getElementById("add-media-section");
            btn_add_tbl_sect     = document.getElementById("add-tbl-section");
            rmv_add_section_menu = document.getElementById("remove-add-section-menu");

            btn_add_txt_sect.onclick     = addTxtSection;
            btn_add_media_sect.onclick   = addMediaSection;
            btn_add_tbl_sect.onclick     = addTblSection;
            rmv_add_section_menu.onclick = removeAddSectionMenu;
        }
    }

    function divPlaceholder() {
        console.log("placeholder:", current_el_id);
    }





//------------------------------------------
// App.Init
//------------------------------------------

    /*
     * This function was created due to the closure inside the loops
     */
    function setCoreElementEventListener(el) {
        var is_new_elem = false; // If element added dinamically this turns into "true"

        // Check if it's single element and convert it to array
        if (!el.length && !!el) {
            var elem = {};
            Array.prototype.push.call(elem, el);
            el = elem;
            is_new_elem = true;
        }
        
        // Loop through each 'text editor content' element and add event listeners
        for(var i = 0; el[i] !== undefined; i++) {

            var content_div       = el[i].getElementsByClassName("text-editor-content")[0],
                add_section_above = el[i].getElementsByClassName("add-above")[0],
                add_section_below = el[i].getElementsByClassName("add-below")[0],
                move_sec_up       = el[i].getElementsByClassName("move-sec-up")[0],
                move_sec_down     = el[i].getElementsByClassName("move-sec-down")[0];

            // Adding event listeners
            content_div.addEventListener("paste",     makePlain,    false); // Paste unformatted text
            content_div.addEventListener("drop",      makePlain,    false); // Drops unformatted text

            content_div.addEventListener("focus",     function(){
                is_in_focus = true; // got the focus

                addClass(this.parentNode.parentNode, "hover"); // add .hover for main container when in focus

                if(sel_type==="Range"){ showTools(); }
            }, false);
            
            // Saves all data into textarea.
            // Hides editing tools when out of editing element focus.
            content_div.addEventListener("blur",      function(e, i) {
                return function() {
                    is_in_focus = false; // Lost the focus
                    
                    removeClass(this.parentNode.parentNode, "hover"); // remove .hover for main container when in blur

                    // Set unique ID for every element
                    is_new_elem ? setID(elem_amount-1) : setID(i);

                    // Updates textarea for back-end submition
                    updateTextarea(e);

                    // Defines whether user selected text or not
                    sel_type = checkSelectionType(window.getSelection());
                    if(sel_type === "None" || sel_type === "Caret") { hideTools(); }
                };
            }(content_div, i), false);

            // Place formatting tools
            content_div.addEventListener("mousemove", function() {          // React on mouse move. Remove this if performance will be low
                if(is_in_focus === true) { positionTools(); }
            }, false);

            format_tools_div.addEventListener("mousemove", function() {// React on mouse move. Remove this if performance will be low
                if(is_in_focus === true) { positionTools(); }
            }, false);

            content_div.addEventListener("mouseup",   positionTools, false); // Show formatting tools when SELECTED with MOUSE
            content_div.addEventListener("keyup",     function() {
                divPlaceholder();
                positionTools();
            }, false); // Show formatting tools when SELECTED with KEYBOARD
            document.addEventListener("scroll",    function() {        // Show formatting tools when Scroll and move with the content
                if(sel_type === "Range") { positionTools(); }
            }, false);

            // Sets event listener for "Add new section" buttons aka "Pluses"(+)
            add_section_above.onclick = function(e) { addNewSectionMenu(e, "above"); }
            add_section_below.onclick = function(e) { addNewSectionMenu(e, "below"); }

            move_sec_up.onclick       = function(e) { moveSection(e, "up"); }
            move_sec_down.onclick     = function(e) { moveSection(e, "down"); }
            
            setEventsForSection(el[i]);
            
            // Inscrease overall amount of elements
            elem_amount++;
        }
    }

    // Add all events after initiall run
    setCoreElementEventListener(section_container);
    setEventsForMediaContainer(media_container);

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

    setFormatTools();

    document.getElementById("show-elem-amount").onclick = function() {
        console.log("elem_amount:", elem_amount);
    };

})(window, document);