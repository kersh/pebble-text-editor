/* 
 * Pebble Text Editor
 * Copyright @ Pebble Learning
 */
;




(function(window, document, undefined){ // ============ MOBILE
//------------------------------------------
// All variables defined here
//------------------------------------------

    /*
     * List of used classes.
     * If you rename default classes in HTML&CSS,
     * REMEMBER to rename them here as well
     */
    var cls_section         = "text-area-holder", // section (core element)
        cls_editablediv     = "text-editor-content", // contenteditable div with content
        cls_content_wrapper = "editor-content-wrapper", // container with content (text, media, placeholder)
        cls_media_container = "media-container"; // container for media and media options

    // Helpers
    var sel_type          = "Caret";     // variable to store type of selection: caret or range
    var show_menu_class   = "show-menu"; // Class for making visible the context menus
    var is_italic         = false;       // Variable for removing extra formatting from any of paragraphs
    var link_placeholder  = "none";      // Is a placeholder for input field when create a web/email link

    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent ); // iOS detection. Will be either true or false. Need for position:fixed bug
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

    var section_container = document.getElementsByClassName(cls_section);            // section container
    var media_container   = document.getElementsByClassName(cls_media_container);    // media container
    var cur_contentdiv, // current section content editable element
        cur_section;     // currently used section

    // 'Add new section' menu elements
    var add_new_section_menu, // Main container
        cls_add_section_menu, // Close menu button
        btn_add_txt_sect,     // Add new text section
        btn_add_media_sect,   // Add new media section
        btn_add_tbl_sect;     // Add new table section

    // Image resizing data
    var cur_mouse_x, cur_mouse_y;

    // All toolbar elements stored in this object
    var toolbar = {
        // Toolbar elements
        bold        : document.getElementById("toggle-bold"),
        italic      : document.getElementById("toggle-italic"),
        
        color_menu  : document.getElementById("toggle-color-menu"),
        color_red   : document.getElementById("color-red"),
        color_green : document.getElementById("color-green"),
        color_blue  : document.getElementById("color-blue"),
        back_from_color : document.getElementById("back-main-from-color"),

        paragraph   : document.getElementById("toggle-paragraph-menu"),
        h1          : document.getElementById("toggle-heading-h1"),
        h2          : document.getElementById("toggle-heading-h2"),
        back_from_paragraph : document.getElementById("back-main-from-paragraph"),

        web_link    : document.getElementById("toggle-web-link"),
        email_link  : document.getElementById("toggle-email-link"),
        edit_link   : document.getElementById("edit-link"),
        open_link   : document.getElementById("open-link"),

        plain       : document.getElementById("remove-formatting")
    }





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

    /*
     * Finds previous element of same kind in a DOM
     * @el - currently selected element
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
     * Finds next element of same kind in a DOM
     * @el - currently selected element
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





//------------------------------------------
// Editor core functions
//------------------------------------------

    /*
     * Update textarea.
     * This function saves everything from editable div into <textarea> to make it easy to submit data to back-end.
     * 
     * @evt - event object
     * @id - the id of editable div in a DOM tree
     */
    function updateTextarea(cur_sect) {
        var textarea   = cur_sect.getElementsByTagName("textarea")[0]; // textarea where save data in
            content    = cur_contentdiv.innerHTML; // content that will be save in textarea

        textarea.value = content; // copy content from editable div into right textarea
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
            link_placeholder = selected_link;
            addClass(main_menu, "is-link");
        } else {
            link_placeholder = "none";
            removeClass(main_menu, "is-link");
        }

        return selected_link;
    }

    /*
     * Function that defines position of formatting tools on the screen.
     * It finds the position of selected range and places toolbox next to that.
     */
    var positionTools = function(){
        var oRange, oRect, selection, sel_width, sel_height, dist_to_top, dist_to_left;

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
            
            // Should move arrow pointer in the middle of selection
            if(sel_width > 10){
                sel_width = (sel_width - 10) / 2;
                arrow_pointer.style.left = oRect.left + sel_width + "px";
            }
            else {
                arrow_pointer.style.left = "0px";
            }

            // Check if web link or email link currently selected to show different menu
            checkExistingLink();

            // FIX LATER
            var width_em = 28.688;
            var mobile_width = width_em * 16;

            // position:fixed iOS bug when keyboard is on the screen
            if (iOS) {
                // console.log("iOS");
                dist_to_top = oRect.top + sel_height; // works on iOS
            } else {
                // console.log("Rest OS");
                dist_to_top = oRect.top + window.pageYOffset + sel_height; // should work everywhere else
            }

            dist_to_top = dist_to_top + 20;
            
            dist_to_left = 0;

            // console.log("dist_to_top:", dist_to_top);

            // Place tools in right place
            if (window.innerWidth < mobile_width) {
                showTools(dist_to_top, 0);
            } else {
                showTools(dist_to_top, dist_to_left);
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
        document.execCommand("bold", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Make text italic and backwards
     */
    function toggleItalic() {
        document.execCommand("italic", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
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
        
        cur_contentdiv.focus(); // return focus back to editing field
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
    function createWebLink() {
        hideAllContextMenus();

        var saved_selection = saveSelection(); // Save selection for link. Fix for touch devices

        if (link_placeholder == "none") {
            link_placeholder = "http://";
        }

        var url = prompt("Please enter web link (e.g.: http://www.domain.co.uk)", link_placeholder);
        // If NOT null and NOT empty
        if(!!url && url !== "" && url !== "http://") {
            if (url.substring(0,7) !== "http://") {
                url = "http://" + url;
            }
            url = "javascript:window.open('" + url + "')";
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
    function createEmailLink() {
        hideAllContextMenus();

        var saved_selection = saveSelection(); // Save selection for link. Fix for touch devices

        var stop = true;

        if (link_placeholder == "none") {
            link_placeholder = "";
        }

        while(stop) {
            var email = prompt("Please enter email link (e.g.: name@domain.co.uk)", link_placeholder);
            // If NOT null and NOT valid
            if(validateEmail(email)) {
                stop = false;
                restoreSelection(saved_selection);              // restore selection and apply link to it
                document.execCommand("unlink", false, null);    // removes previously existing link
                email = "mailto:" + email;
                email = "javascript:window.open('" + email + "')";
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
            var link = prompt("Please make changes to link:", link_placeholder);

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
                    link_placeholder = link;
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
                        link_placeholder = link;
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
                    link_placeholder = link;
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
        window.open(link_placeholder);
        return false;
    }

    /*
     * Accordingly changes color of selected text
     * @color defines color that will be applied
     */
    function setColor(color) {
        document.execCommand("foreColor", false, color);

        cur_contentdiv.focus(); // return focus back to editing field
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

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        document.execCommand("removeFormat", false, null);
        document.execCommand("unlink", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
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
// Media functions
//------------------------------------------

    /*
     * Event for aligning media within section
     */
    function alignMedia() {
        var elem = this.parentNode.parentNode;
        var value = window.getComputedStyle(elem, null).getPropertyValue("float");

        if (value == "right") {
            elem.style.display = "none";
            elem.style.styleFloat = "left"; // ie style
            elem.style.cssFloat   = "left"; // all rest browser style

            this.innerHTML = "Right";

            setTimeout( function(){
                elem.style.display = "";
            }, 150);
        } else {
            elem.style.display = "none";
            elem.style.styleFloat = "right"; // ie style
            elem.style.cssFloat   = "right"; // all rest browser style
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
     * Calculates how much to resize the media container
     *
     * @direction - which side was dragged (can be "left"/"right" bottom corner)
     * @media_el - current media element
     */
    function calculateResize(e, direction, media_el) {
        var dist_x, dist_y, sum, cur_width, pows, diagonal, ratio;

        // Current width of media container
        cur_width = parseFloat(media_el.style.getPropertyValue("width").replace("%",""));

        console.log("cur_width:", cur_width);

        // Direction: to top right corner (-> ^)
        if (direction == "left") {
            dist_x   = e.clientX - cur_mouse_x;
            dist_y   = cur_mouse_y - e.clientY;
            sum      = dist_x + dist_y;
            pows     = Math.pow(dist_x, 2) + Math.pow(dist_y, 2);
            diagonal = Math.sqrt(pows);
            // console.log("dist_x:",dist_x, "dist_y:",dist_x);
        }
        // Direction: left top corner
        else {
            dist_x   = cur_mouse_x - e.clientX;
            dist_y   = cur_mouse_y - e.clientY;
            sum      = dist_x + dist_y;
            pows     = Math.pow(dist_x, 2) + Math.pow(dist_y, 2);
            diagonal = Math.sqrt(pows);
        }

        // Set new ration
        ratio = diagonal * 0.2;

        // Make image smaller
        if (sum > 0) {
            if (cur_width > 20) { // set minimum limit
                cur_width = cur_width - ratio;
                media_el.style.width = cur_width + "%";
            }
        }
        // Make image bigger
        else {
            if (cur_width < 99) { // set maximum limit
                cur_width = cur_width + ratio;
                media_el.style.width = cur_width + "%";
            }
        }

        // Set current new mouse coordinates
        cur_mouse_x = e.clientX;
        cur_mouse_y = e.clientY;

        return false;
    }

    /*
     * Resize image width in % accordingly to user actions
     *
     * @media_el - element that will be resized
     * direction - can be left or right
     */
    function resizeImg(e, media_el, direction) {
        var cur_width;

        // Disable selestion on drag
        document.onselectstart = function(){ return false; }
        
        // Set current mouse location
        cur_mouse_x = e.clientX;
        cur_mouse_y = e.clientY;

        // Keep cursor changed
        if (direction == "left") {
            addClass(document.documentElement, "ne-resize");
        } else {
            addClass(document.documentElement, "nw-resize");
        }

        // Run function to calculate and resize image
        document.onmousemove = function(e) { calculateResize(e, direction, media_el) };

        // Remove event listener
        document.onmouseup  = function() {
            removeClass(document.documentElement, "ne-resize");
            removeClass(document.documentElement, "nw-resize");

            // Find current width of media element
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





//------------------------------------------
// Section functions
//------------------------------------------

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
     * @direction - can be 'up' or 'down'
     */
    function moveSection(elem, direction) {
        var el = elem.parentNode.parentNode.parentNode,
            par_el = el.parentNode,
            ref_el;
        
        if (direction == "up") {
            ref_el = prev(el);

            if (ref_el !== null) {
                par_el.insertBefore(el, ref_el);
            }
        }
        else {
            ref_el = next(el);

            if (ref_el !== null) {
                par_el.insertBefore(ref_el, el);
            }
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
     * @float - can be "left"/"right"
     */
    function addMedia(elem, float) {
        var btn_value = "Left"; // Default button value
        var parent_el = elem.parentNode.parentNode.parentNode.parentNode.getElementsByClassName(cls_content_wrapper)[0]; // parent element
        var first_child_el = parent_el.firstChild; // first child element
        
        var media_div = document.createElement("div"); // main media container
        media_div.className = cls_media_container;
        
        media_div.style.styleFloat = float; // ie style
        media_div.style.cssFloat = float; // all rest browser style

        media_div.style.width = "30%"; // default width
        
        // Should change button value opposite to current state
        if (float == "left") {
            btn_value = "Right";
        }

        media_div.innerHTML = '<div class="media-options">'
                            +   '<button class="align-media">'+ btn_value +'</button>'
                            +   '<button class="replace-media">Replace</button>'
                            +   '<button class="remove-media">Remove</button>'
                            +   '<div class="resize-img-left-bot"></div>'
                            +   '<div class="resize-img-right-bot"></div>'
                            + '</div>'
                            + '<img src="img/cat2.jpg" alt="cat"/>';

        parent_el.insertBefore(media_div, first_child_el); // insert new created container into section
        setEventsForMediaContainer(media_div);             // add all necessary event listeners

        removeClass(elem.parentNode, "show"); // hide option for "add media" (left/right)
    }

    /*
     * Placeholder like native HTML5
     */
    function placeholder() {
        var placeholder_el = cur_contentdiv.parentNode.getElementsByClassName("placeholder")[0];

        setTimeout(function(){
            if (cur_contentdiv.innerHTML.length > 0 && cur_contentdiv.innerHTML != "<br>") {
                removeClass(placeholder_el, "show");
            } else {
                addClass(placeholder_el, "show");
            }
        }, 0);
    }

    /*
     * Checks if .hover needed for section
     */
    function checkHover(e) {
        console.log("e.target:", e.target);
        // if (hasClass(cur_section, "hover")) {
        //     removeClass(cur_section, "hover");
        // }
    }





//------------------------------------------
// Add New Section Menu functions
//------------------------------------------

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
                                 + '<button id="close-add-section-menu">✖</button>';

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
            section_el.className = cls_section + ' group';
            section_el.innerHTML = '<button class="add-btn add-above">+</button>'
                                 + '<div class="'+ cls_content_wrapper +'">'
                                 + '<div class="placeholder">Start typing here...</div>'
                                 + '<div class="'+cls_editablediv+'" contenteditable></div>'
                                 + '</div><!-- /.'+ cls_content_wrapper +' -->'
                                 + '<textarea name="text-editor-textarea" class="text-editor-textarea"></textarea>'
                                 + '<div class="section-options">'
                                 + '<div class="core-options-holder">'
                                 + '<button class="remove-section"><i class="fa fa-trash-o"></i></button>'
                                 + '<button class="move-sec-up"><i class="fa fa-angle-up"></i></button>'
                                 + '<button class="move-sec-down"><i class="fa fa-angle-down"></i></button>'
                                 + '<button class="add-media"><i class="fa fa-picture-o"></i></button>'
                                 + '<div class="align-media-choice">'
                                 + '<button class="add-media-left"><i class="fa fa-reply"></i></button>'
                                 + '<button class="add-media-right"><i class="fa fa-share"></i></button>'
                                 + '</div><!-- /.align-media-choice -->'
                                 + '</div><!-- /.core-options-holder -->'
                                 + '<button class="add-btn add-below">+</button>'
                                 + '</div><!-- /.section-options -->';
        
        ref_el.style.display = "none";

        par_el.insertBefore(section_el, ref_el);
        setSectionEventListeners(section_el); // add event listeners
        section_el.getElementsByClassName(cls_editablediv)[0].focus();
        
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





//------------------------------------------
// Event listeners
//------------------------------------------

    /*
     * Sets all event listeners for media container elements
     * @el - elements or set of elements
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

            // Resize from left bottom corner
            el[i].getElementsByClassName("resize-img-left-bot")[0].onmousedown  = function(e) { resizeImg(e, this.parentNode.parentNode, "left") };

            // Resize from right bottom corner
            el[i].getElementsByClassName("resize-img-right-bot")[0].onmousedown = function(e) { resizeImg(e, this.parentNode.parentNode, "right") };
        }
    }

    /*
     * Sets all events for "Add new section" menu
     */
    function setEventsForAddNewSection() {
        // 'Add new section' menu element
        add_new_section_menu = document.getElementById("add-new-section-menu");
        
        // All buttons within menu
        btn_add_txt_sect     = document.getElementById("add-text-section");
        btn_add_media_sect   = document.getElementById("add-media-section");
        btn_add_tbl_sect     = document.getElementById("add-tbl-section");
        cls_add_section_menu = document.getElementById("close-add-section-menu"); // close menu

        // If element exists then add events
        if (!!add_new_section_menu) {
            btn_add_txt_sect.onclick     = addTxtSection;
            btn_add_media_sect.onclick   = addMediaSection;
            btn_add_tbl_sect.onclick     = addTblSection;
            cls_add_section_menu.onclick = removeAddSectionMenu;
        }
    }

    /*
     * This function was created due to the closure inside the loops
     */
    function setSectionEventListeners(el) {
        var add_section_above,  // (+) add new section above button
            add_section_below,  // (+) add new section below button
            
            content_div,        // section container itself
            btn_rmv_section,    // remove section button
            btn_move_sec_up,    // move section up button
            btn_move_sec_down,  // move section down button
            btn_add_media,      // add new media
            btn_add_med_left,   // adds media on the left
            btn_add_med_right;  // adds media on the right

        // Check if it's single element and convert it to array
        if (!el.length && !!el) {
            var elem = {};
            Array.prototype.push.call(elem, el);
            el = elem;
        }

        // Loop through each 'text editor content' element and add event listeners
        for(var i = 0; el[i] !== undefined; i++) {
            add_section_above = el[i].getElementsByClassName("add-above")[0],
            add_section_below = el[i].getElementsByClassName("add-below")[0],
            
            content_div       = el[i].getElementsByClassName(cls_editablediv)[0],
            btn_rmv_section   = el[i].getElementsByClassName("remove-section")[0]
            btn_move_sec_up   = el[i].getElementsByClassName("move-sec-up")[0],
            btn_move_sec_down = el[i].getElementsByClassName("move-sec-down")[0];
            btn_add_media     = el[i].getElementsByClassName("add-media")[0];
            btn_add_med_left  = el[i].getElementsByClassName("add-media-left")[0];
            btn_add_med_right = el[i].getElementsByClassName("add-media-right")[0];
            cur_section       = el[i]; // sets current section element
            cur_contentdiv    = content_div; // sets current editable div element


            // Run placeholder right after load
            content_div.addEventListener("load",  placeholder(),  false);

            // Show or hide placeholder within section
            content_div.addEventListener("keydown", placeholder, false); // ??
            
            // Put all date into textarea right after load
            content_div.addEventListener("load",  updateTextarea(el[i]),  false);

            // Apply changes to main container after focus
            content_div.addEventListener("focus", function(el){
                return function() {
                    // Update current editable div to indicate working element
                    cur_section    = el; // sets current section element
                    cur_contentdiv = el.getElementsByClassName(cls_editablediv)[0]; // sets current editable div element

                    // Add .hover for main container when in focus
                    addClass(this.parentNode.parentNode, "hover");

                    // Check if need to show editing toolbar
                    if(sel_type==="Range"){ showTools(); }
                    
                    // Ability to get selection. Fix for touch devices.
                    timer = setInterval(positionTools, 150);
                };
            }(el[i]), false);

            // Make possible to paste plain text
            content_div.addEventListener("paste", pastePlain,    false);

            /* Place formatting tools */
            // Touch events ??
            content_div.addEventListener("touchstart", function() { positionTools; }, false);
            content_div.addEventListener("touchmove", function() { positionTools; }, false);
            content_div.addEventListener("touchend",   function() { positionTools; }, false);
            el[i].addEventListener("touchstart", function(e) { checkHover(e); }, false);

            
            // Show formatting tools when Scroll and move with the content
            document.addEventListener("scroll", function() {
                if(sel_type === "Range") { positionTools(); } }, false); // ??

            
            // Saves all data into textarea.
            // Hides editing tools when out of editing element focus.
            content_div.addEventListener("blur", function(el) {
                return function() {
                    // Remove .hover for main container when in blur
                    removeClass(this.parentNode.parentNode, "hover");
                    // checkHover();

                    // Updates textarea for back-end submition
                    updateTextarea(el);


                    // Defines whether user selected text or not
                    sel_type = checkSelectionType(window.getSelection());
                    if(sel_type === "None" || sel_type === "Caret") { hideTools(); }

                    // Clears timer variable when not in use
                    clearInterval(timer);
                    
                };
            }(el[i]), false);

            /* Section actions */
            // Sets event listener for "Add new section" buttons aka "Pluses"(+)
            add_section_above.onclick = function(e) { addNewSectionMenu(e, "above"); }
            add_section_below.onclick = function(e) { addNewSectionMenu(e, "below"); }

            // Event listener to remove section
            btn_rmv_section.onclick = removeSection;

            // Event to toggle "Add media" menu
            btn_add_media.onclick = toggleMediaMenu;

            // Event to insert media into section
            btn_add_med_left.addEventListener("click", function(){ addMedia(this, "left"); }, false);
            btn_add_med_right.addEventListener("click", function(){ addMedia(this, "right"); }, false);

            // Move section up/down
            btn_move_sec_up.addEventListener("click", function(){ moveSection(this, "up"); }, false);
            btn_move_sec_down.addEventListener("click", function(){ moveSection(this, "down"); }, false);
        }
    }

    /*
     * Sets actions for all toolbar buttons
     */
    function setToolbar() {
        // Fast click for all touch devices to fix 300ms delay on click
        var fastClickButtons = format_tools_div.getElementsByTagName("button"); // Array with all toolbar buttons
        
        for (var n=0; n < fastClickButtons.length; n++) { // Loop through every button and add it to FastClick object
            new FastClick(fastClickButtons[n]);
        }

        // Toolbar buttons and their actions
        toolbar.bold.addEventListener("click", toggleBold,   false);
        toolbar.italic.addEventListener("click", toggleItalic, false);
        
        toolbar.color_menu.addEventListener("click", toggleColorMenu, false);
        toolbar.color_red.addEventListener("click", function(){ setColor("red") }, false);
        toolbar.color_green.addEventListener("click", function(){ setColor("green") }, false);
        toolbar.color_blue.addEventListener("click", function(){ setColor("blue") }, false);
        toolbar.back_from_color.addEventListener("click", toggleColorMenu, false);

        toolbar.paragraph.addEventListener("click", toggleParagraphMenu, false);
        toolbar.h1.addEventListener("click", function(){ toggleHeading("h1"); }, false);
        toolbar.h2.addEventListener("click", function(){ toggleHeading("h2"); }, false);
        toolbar.back_from_paragraph.addEventListener("click", toggleParagraphMenu, false);

        toolbar.web_link.addEventListener("click", function(){ createWebLink(); }, false);
        toolbar.email_link.addEventListener("click", function(){ createEmailLink(); }, false);
        toolbar.edit_link.addEventListener("click", function(){ editLink(); }, false);
        toolbar.open_link.addEventListener("click", function(){ openLink(); }, false);
        
        toolbar.plain.addEventListener("click", function(){ removeFormatting(); }, false);
    }





//------------------------------------------
// Application Init
//------------------------------------------

    window.PebbleEditor = (function()
    {
        var _init = false, app = {};

        app.init = function() {
            // Exit function if it's already running
            if (_init) { return; }

            // Indicate that function is running
            _init = true;

            // Add all events after initiall run
            setSectionEventListeners(section_container);
            setEventsForMediaContainer(media_container);
            setToolbar();
        };

        return app;

    })();

    window.PebbleEditor.init();

    // Run this script only when content is loaded and addEventListener is suppported by the browser
    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', window.PebbleEditor.init(), false);
    }

})(window, document);