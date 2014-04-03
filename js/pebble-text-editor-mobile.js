/* 
 * Pebble Text Editor
 * Copyright @ Pebble Learning
 */
;




(function(window, document, undefined){ // ============ MOBILE

    // All variables defined here
    //==========================================

    // List of used classes.
    // If you rename default classes in HTML & CSS,
    // REMEMBER to rename them here as well
    //---------------------------------------------
//    var cls_section         = "text-area-holder", // section (core element)
//        cls_editablediv     = "text-editor-content", // contenteditable div with content
//        cls_content_wrapper = "editor-content-wrapper", // container with content (text, media, placeholder)
//        cls_media_container = "media-container"; // container for media and media options

    // Helpers, Globals
    //-----------------
    var cur_contentdiv,                  // current section content editable element
        last_used_list_of_tools,         // list of tools that been used last
        cur_mouse_x, cur_mouse_y;        // image resizing data
    var sel_type          = "Caret";     // variable to store type of selection: caret or range
    var show_menu_class   = "show-menu"; // class for making visible the context menus
    var is_italic         = false;       // variable for removing extra formatting from any of paragraphs
    var link_placeholder  = "none";      // is a placeholder for input field when create a web/email link

    // Touch devices
    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent ); // iOS detection. Will be either true or false. Need for position:fixed bug
    var timer = null;  // timer for mobile and tablet devices
    var selectedRange; // selected range for mobile and tablet devices

    // All toolbar elements stored in this object
    //-------------------------------------------
    var ToolbarElement = {
        // toolbar core container initialisation
        init_toolbar : function() {
            // create element
            var toolbar_div_new           = document.createElement("div");
                toolbar_div_new.id        = "toolbar";
                toolbar_div_new.className = "toolbar group";
                toolbar_div_new.innerHTML = '<div id="arrow-pointer" class="arrow-pointer"></div>';

            // append element to the DOM
            document.body.insertBefore(toolbar_div_new, document.body.firstChild);
        },

        // toolbar ui elements
        toolbar          : function() { return document.getElementById("toolbar") },           // toolbar container itself
        buttons_container: function() { return document.getElementById("buttons-container") }, // main buttons holder
        main_menu        : function() { return document.getElementById("main-menu") },         // main menu
        color_menu       : function() { return document.getElementById("color-menu") },        // context menu that holds color pallete
        paragraph_menu   : function() { return document.getElementById("paragraph-menu") },    // context menu that holds heading/paragraph styles
        buttons_wrapper  : function() { return document.getElementById("buttons-container") }, // all button holder
        arrow_pointer    : function() { return document.getElementById("arrow-pointer") },     // arrow icon that pointing on selection

        // toolbar buttons (functionality)
        bold             : function() { return document.getElementById('toggle-bold') },       // "make bold" button
        italic           : function() { return document.getElementById('toggle-italic') },     // "make italic" button

        color_toggle     : function() { return document.getElementById("toggle-color-menu") }, // "open color menu" button
          color_red      : function() { return document.getElementById("color-red") },         // "make text red" button
          color_green    : function() { return document.getElementById("color-green") },       // "make text green" button
          color_blue     : function() { return document.getElementById("color-blue") },        // "make text blue" button
        back_from_color  : function() { return document.getElementById("back-main-from-color") },

        paragraph_toggle : function() { return document.getElementById("toggle-paragraph-menu") }, // "open paragraph menu" button
          h1             : function() { return document.getElementById("toggle-heading-h1") }, // "make text as h1" button
          h2             : function() { return document.getElementById("toggle-heading-h2") }, // "make text as h2" button
        back_from_paragraph : function() { return document.getElementById("back-main-from-paragraph") },

        web_link         : function() { return document.getElementById("toggle-web-link") },   // "create a web link (starts with http://)" button
        email_link       : function() { return document.getElementById("toggle-email-link") }, // "create an email link (starts with mailto:)" button
          edit_link      : function() { return document.getElementById("edit-link") },         // "edit selected link" button
          open_link      : function() { return document.getElementById("open-link") },         // "open selected link" button

        plain            : function() { return document.getElementById("remove-formatting") }  // "remove all formatting" button
    };
    // run initial toolbar
    ToolbarElement.init_toolbar();

    // All section UI elements stored here
    //------------------------------------
    var SectionElement = {
        // List of used classes.
        editablediv_cls     : "text-editor-content",    // contenteditable div with content
        content_wrapper_cls : "editor-content-wrapper", // container with content (text, media, placeholder)
        media_container_cls : "media-container",        // container for media and media options

        // 'Add new section' menu elements
        add_new_section_menu : '', // main container
        cls_add_section_menu : '', // close menu button
        btn_add_txt_sect     : '', // add new text section
        btn_add_media_sect   : '', // add new media section
        btn_add_tbl_sect     : '', // add new table section

        media_container : function() { // all media containers
            return document.getElementsByClassName(this.media_container_cls); },

        editablediv_container : function() { // all editable div containers
            return document.getElementsByClassName(this.editablediv_cls); }
    };



    // All core elements
//    var arrow_pointer     = document.getElementById("arrow-pointer");                // arrow icon that pointing on selection
//    var content_elements  = document.getElementsByClassName("text-editor-content");  // set of core editor elements (editable divs)
//    var textarea_elements = document.getElementsByClassName("text-editor-textarea"); // set of core editor elements (editable divs)
//    var format_tools_div  = document.getElementById("toolbar");                      // div with formatting tools
//    var main_menu         = document.getElementById("main-menu");                    // main menu
//    var color_menu        = document.getElementById("color-menu");                   // context menu that holds color pallete
//    var paragraph_menu    = document.getElementById("paragraph-menu");               // context menu that holds heading/paragraph styles

//    var section_container = document.getElementsByClassName(cls_section);            // section container
//    var media_container   = document.getElementsByClassName(cls_media_container);    // media container
//
        var last_section,    // recently used section
            last_media_item; // recently used media container

    // 'Add new section' menu elements
//    var add_new_section_menu, // Main container
//        cls_add_section_menu, // Close menu button
//        btn_add_txt_sect,     // Add new text section
//        btn_add_media_sect,   // Add new media section
//        btn_add_tbl_sect;     // Add new table section

    // All toolbar elements stored in this object
//    var toolbar = {
//        // Toolbar elements
//        bold        : document.getElementById("toggle-bold"),
//        italic      : document.getElementById("toggle-italic"),
//
//        color_menu  : document.getElementById("toggle-color-menu"),
//        color_red   : document.getElementById("color-red"),
//        color_green : document.getElementById("color-green"),
//        color_blue  : document.getElementById("color-blue"),
//        back_from_color : document.getElementById("back-main-from-color"),
//
//        paragraph   : document.getElementById("toggle-paragraph-menu"),
//        h1          : document.getElementById("toggle-heading-h1"),
//        h2          : document.getElementById("toggle-heading-h2"),
//        back_from_paragraph : document.getElementById("back-main-from-paragraph"),
//
//        web_link    : document.getElementById("toggle-web-link"),
//        email_link  : document.getElementById("toggle-email-link"),
//        edit_link   : document.getElementById("edit-link"),
//        open_link   : document.getElementById("open-link"),
//
//        plain       : document.getElementById("remove-formatting")
//    };

    // Init of editor
    //---------------
    var PebblePadTextEditor = function(option) {
        return new PebblePadTextEditorObj(option);
    }

    // Core editor object
    //-------------------
    var PebblePadTextEditorObj = function(option) {

        // Option object
        //--------------
        option = option || {};

        // main section class name
        this.section_class   = option.section_class   || "editor-section";

        // toolbar buttons want to include
        this.toolbar_include = option.toolbar_include || "default";

        // toolbar buttons want to exclude
        this.toolbar_exclude = option.toolbar_exclude || "default";

        // has section menus like "up", "down", "add new section", etc.
        if(option.paste_plain === false) { option.paste_plain = "false"; } // to be possible to type "false" without '"'
        this.paste_plain = option.paste_plain || true;

        // make false if want to keep formatted text, when paste into editor
        if(option.has_section_menus === false) { option.has_section_menus = "false"; } // to be possible to type "false" without '"'
        this.has_section_menus = option.has_section_menus || true; // by default all sections with pluses (+) and other menus


        // Object variables
        //-----------------
        this.section_cls = option.section_class; // section (core element)
        this.section_element = document.getElementsByClassName(this.section_cls); // section container
        this.cur_contentdiv; // current section element

        // Creates new list of tools for particular section
        //-------------------------------------------------
        this.define_list_of_tools = function() {
            var default_list_of_tools = ["bold", "italic", "color", "paragraph", "web link", "email link", "plain"];
            // if not set at all
            if (this.toolbar_include === "default" && this.toolbar_exclude === "default") {
                return default_list_of_tools;
            }

            // Do this if for including tools
            if (this.toolbar_include !== "default") {
                return this.toolbar_include;
            }

            // Do this if for excluding tools from main array
            if (this.toolbar_include === "default" && this.toolbar_exclude !== "default") {
                // Find match and remove item from main array
                for(var i=0; i < this.toolbar_exclude.length; i++) {
                    for(var n=0; n < default_list_of_tools.length; n++) {
                        if(this.toolbar_exclude[i] === default_list_of_tools[n]) {
                            default_list_of_tools.splice(n, 1); // remove matched item from main array
                        }
                    }
                }
                return default_list_of_tools;
            }
        }

        // New list of item for current object
        this.list_of_tools = this.define_list_of_tools();


        // Add New Section Menu functions
        //==========================================

        // "Add new section" buttons aka "Pluses"(+)
        //------------------------------------------
        this.addNewSectionMenu = function(e, location) {
            var par_el, ref_el,
                add_new_el = document.createElement("div");
            add_new_el.id = "add-new-section-menu";
            add_new_el.className = "add-new-section-menu";
            add_new_el.innerHTML = '<button id="add-text-section"><div class="icon">+</div><div class="lbl">Text Section</div></button>'
                + '<button id="add-media-section"><div class="icon">+</div><div class="lbl">Media Section</div></button>'
                + '<button id="add-tbl-section"><div class="icon">+</div><div class="lbl">Table Section</div></button>'
                + '<button id="add-video-link"><div class="icon">+</div><div class="lbl">Video Link</div></button>'
                + '<button id="close-add-section-menu">✖</button>';

            SectionElement.add_new_section_menu = document.getElementById("add-new-section-menu");

            // Remove menu if it already exists
            if (!!SectionElement.add_new_section_menu) {
                this.removeAddSectionMenu();
            }

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
            this.setEventsForAddNewSection();
        }

        // Removes "Add new section" menu from DOM
        //----------------------------------------
        this.removeAddSectionMenu = function() {
            removeClass(SectionElement.add_new_section_menu, "show");
            SectionElement.add_new_section_menu.parentNode.removeChild(SectionElement.add_new_section_menu);
        }

        // Add txt section to DOM
        //-----------------------
        this.addTxtSection = function(section_cls) {
            var par_el = SectionElement.add_new_section_menu.parentNode,
                ref_el = SectionElement.add_new_section_menu,
                section_el = document.createElement("div");

            section_el.className = section_cls + ' group';
            section_el.innerHTML = '<button class="add-btn add-above">+</button>'
                + '<div class="'+ SectionElement.content_wrapper_cls +'">'
                + '<div class="placeholder">Start typing here...</div>'
                + '<div class="'+ SectionElement.editablediv_cls +'" contenteditable></div>'
                + '</div><!-- /.'+ SectionElement.content_wrapper_cls +' -->'
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
            this.setSectionEvents(section_el); // add event listeners
            section_el.getElementsByClassName(SectionElement.editablediv_cls)[0].focus();

            this.removeAddSectionMenu();
        }

        // Add media only section to DOM
        //------------------------------
        this.addMediaSection = function(section_cls) {
            console.log("add media section");
        }

        // Add table section to DOM
        //-------------------------
        this.addTblSection = function(section_cls) {
            console.log("add tbl section");
        }

        // Section Event listeners
        //==========================================

        // Sets all events for "Add new section" menu
        //-------------------------------------------
        this.setEventsForAddNewSection = function() {

            // // 'Add new section' menu element
            SectionElement.add_new_section_menu = document.getElementById("add-new-section-menu");

            // // All buttons within menu
            SectionElement.btn_add_txt_sect     = document.getElementById("add-text-section");
            SectionElement.btn_add_media_sect   = document.getElementById("add-media-section");
            SectionElement.btn_add_tbl_sect     = document.getElementById("add-tbl-section");
            SectionElement.cls_add_section_menu = document.getElementById("close-add-section-menu"); // close menu

            // If element exists then add events
            if (!!SectionElement.add_new_section_menu) {
                SectionElement.btn_add_txt_sect.onclick     = function (obj) {
                    return function() { obj.addTxtSection(obj.section_cls); }
                }(this);

                SectionElement.btn_add_media_sect.onclick   = function (obj) {
                    return function() { obj.addMediaSection(obj.section_cls); }
                }(this);

                SectionElement.btn_add_tbl_sect.onclick     = function (obj) {
                    return function() { obj.addTblSection(obj.section_cls); }
                }(this);

                SectionElement.cls_add_section_menu.onclick = this.removeAddSectionMenu;
            }
        }

        // Sets all event listeners each section element
        // @el - element or set of elements
        //----------------------------------------------
        this.setSectionEvents = function(el) {
            // Section menus
            //--------------
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
                // That check only for situation when the
                // elements with section_cls doesn't exist on a page
                if(el[i].length !== undefined) { break; }

                add_section_above = el[i].getElementsByClassName("add-above")[0];
                add_section_below = el[i].getElementsByClassName("add-below")[0];

                content_div       = el[i].getElementsByClassName(SectionElement.editablediv_cls)[0];
                btn_rmv_section   = el[i].getElementsByClassName("remove-section")[0];
                btn_move_sec_up   = el[i].getElementsByClassName("move-sec-up")[0];
                btn_move_sec_down = el[i].getElementsByClassName("move-sec-down")[0];
                btn_add_media     = el[i].getElementsByClassName("add-media")[0];
                btn_add_med_left  = el[i].getElementsByClassName("add-media-left")[0];
                btn_add_med_right = el[i].getElementsByClassName("add-media-right")[0];
                cur_contentdiv    = content_div; // sets current editable div element

                // Run placeholder right after load
                content_div.addEventListener("load",  function() {
                    placeholder("load");
                    updateTextarea(el[i]);
                }(),  false);

                // Show or hide placeholder within section
                content_div.addEventListener("keydown", placeholder, false);

                // Apply changes to main container after focus
                content_div.addEventListener("focus", function(el, list_of_tools){
                    return function() {
                        // Create new toolbar only if it wasn't created previously (performance repaint reason)
                        if(last_used_list_of_tools !== list_of_tools) {
                            PebblePadTextEditorObj.prototype.setToolbar(list_of_tools); // create toolbar
                            last_used_list_of_tools = list_of_tools; // update last used list
                        }

                        // Update current editable div to indicate working element
                        cur_contentdiv = el.getElementsByClassName(SectionElement.editablediv_cls)[0];

                        // Flag for toolbar
                        is_in_focus = true;

                        // Add .hover for main container when in focus
                        addClass(this.parentNode.parentNode, "hover");

                        // Check if need to show editing toolbar
                        if(sel_type==="Range"){ showTools(); }

                        // Ability to get selection. Fix for touch devices.
                        timer = setInterval(positionTools, 150);
                    };
                }(el[i], this.list_of_tools), false);

                // Make possible to paste plain text
                content_div.addEventListener("paste", makePlain,    false);

                // Place formatting tools
                //-----------------------
                // Touch events ??
                content_div.addEventListener("touchstart", function() { positionTools; }, false);
                content_div.addEventListener("touchmove", function() { positionTools; }, false);
                content_div.addEventListener("touchend", function() { positionTools; }, false);

                // Show section buttons when touch starts over the section
                el[i].addEventListener("touchstart", function(el) {
                    return function() {
                        checkHover(el);
                    }
                }(el[i]), false);

                // Show formatting tools when Scroll and move with the content
                document.addEventListener("scroll", function() {
                    if(sel_type === "Range") { positionTools(); }
                }, false);

                // Saves all data into textarea
                // Hides editing tools when out of editing element focus
                content_div.addEventListener("blur", function(el) {
                    return function() {

                        // Indicate when focus is lost
                        is_in_focus = false;

                        // Remove .hover for main container when in blur
                        removeClass(this.parentNode.parentNode, "hover");

                        // Updates textarea for back-end submition
                        updateTextarea(el);

                        // Defines whether user selected text or not
                        sel_type = checkSelectionType(window.getSelection());
                        if(sel_type === "None" || sel_type === "Caret") { hideTools(); }

                        // Clears timer variable when not in use
                        clearInterval(timer);
                    };
                }(el[i]), false);

                // Section actions
                //----------------
                if(this.has_section_menus === true) {
                    // Define current object to use within event listeners
                    var current_obj = this;

                    // Sets event listener for "Add new section" buttons aka "Pluses"(+)
                    add_section_above.onclick = function(e) { current_obj.addNewSectionMenu(e, "above"); }
                    add_section_below.onclick = function(e) { current_obj.addNewSectionMenu(e, "below"); }

                    // Event listener to remove section
                    btn_rmv_section.onclick = removeSection;
                    // Move section up/down
                    btn_move_sec_up.addEventListener("click", function(){ moveSection(this, "up", current_obj.section_cls); }, false);
                    btn_move_sec_down.addEventListener("click", function(){ moveSection(this, "down", current_obj.section_cls); }, false);

                    // Event to toggle "Add media" menu
                    btn_add_media.onclick = toggleMediaMenu;
                    // Event to insert media into section
                    btn_add_med_left.addEventListener("click", function(){ addMedia(this, "left"); }, false);
                    btn_add_med_right.addEventListener("click", function(){ addMedia(this, "right"); }, false);
                }
            }
        }


        // Init
        //==========================================

        // All that required for initial run
        //----------------------------------
        this.init = function() {
            this.setSectionEvents(this.section_element); // add section event listeners
            this.setMediaContainerEvents(SectionElement.media_container()); // add media event listeners
        }

        // Initial run
        this.init();
    }



// Helper functions
//==========================================

    /**
     * Checks if element has particular class
     * @param element
     * @param class_name
     * @returns true/false
     */
    function hasClass(element, class_name) {
        if(!!element && !!element) {
            return element.className.match(new RegExp('(\\s|^)' + class_name + '(?!\S)'));
        }
    }

    /**
     * Adds class/classes to an element
     * @param element
     * @param class_name
     */
    function addClass(element, class_name) {
        if (!hasClass(element, class_name)) { element.className += " " + class_name; }
    }

    /**
     * Removes class/classes from an element
     * @param element
     * @param class_name
     */
    function removeClass(element, class_name) {
        if (hasClass(element, class_name)) {
            var regexp = new RegExp('(\\s|^)' + class_name + '(?!\S)');
            element.className = element.className.replace(regexp, '');
        }
    }

    /**
     * Toggle class on element
     * @param element
     * @param class_name
     */
    function toggleClass(element, class_name) {
        if (hasClass(element, class_name)) {
            removeClass(element, class_name);
        } else {
            addClass(element, class_name);
        }
    }

    /**
     * Validates email address
     * @param email
     * @returns {boolean}
     */
    function validateEmail(email) {
        var regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regExp.test(email);
    }

    /**
     * Saves user's text selection
     * @returns {*}
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

    /**
     * Restores saved user's text selection
     * @param savedSel
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

    /**
     * Clears all selections from page
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

    /**
     * Finds previous element of same kind in a DOM
     * @param el
     * @param section_cls
     * @returns {Node}
     */
    function prev(el, section_cls) {
        var prev_el = el.previousSibling,
            check   = true;

        while(check) {
            // If object exists do below
            if (!!prev_el) {
                if (prev_el.nodeType == 1) { // if node type match to <div> then check for class
                    if (!hasClass(prev_el, section_cls)) { // check if class matches to section class
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

    /**
     * Finds next element of same kind in a DOM
     * @param el
     * @param section_cls
     * @returns {Node}
     */
    function next(el, section_cls) {
        var next_el = el.nextSibling,
            check   = true;

        while(check) {
            // If object exists do below
            if (!!next_el) {
                if (next_el.nodeType == 1) { // if node type match to <div> then check for class
                    if (!hasClass(next_el, section_cls)) { // check if class matches to section class
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

    /**
     * Hide context menu
     * @param name_of_menu
     * @param button_id
     */
    function hideContextMenu(name_of_menu, button_id) {
        removeClass(name_of_menu, show_menu_class);
        removeClass(button_id, "is-selected");
    }

    /**
     * Show context menu
     * @param name_of_menu
     * @param button_id
     */
    function showContextMenu(name_of_menu, button_id) {
        addClass(name_of_menu, show_menu_class);
        addClass(button_id, "is-selected");
    }

    /**
     * Hide all open context menus at the same time
     */
    function hideAllContextMenus() {
        hideContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle());     // hide color menu
        hideContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle());  // hide paragraph menu
    }



// Editor core functions
//==========================================

    /**
     * Update textarea.
     * This function saves everything from editable div into <textarea> to make it easy to submit data to back-end.
     * @param cur_sect
     */
    function updateTextarea(cur_sect) {
        var textarea   = cur_sect.getElementsByTagName("textarea")[0]; // textarea where save data in
            content    = cur_contentdiv.innerHTML; // content that will be save in textarea

        textarea.value = content; // copy content from editable div into right textarea
    }

    /**
     * Show formatting tools
     * @param top
     * @param left
     */
    function showTools(top, left) {
        ToolbarElement.toolbar().style.top = top + "px";       // Locate tools
        ToolbarElement.toolbar().style.left = left + "px";     // below the selection
        addClass(ToolbarElement.toolbar(), "show-tools");      // Adding class to make tools visible
    }

    /**
     * Hide formatting tools
     */
    function hideTools() {
        removeClass(ToolbarElement.toolbar(), "show-tools");   // Removes class to hide tools

        // Hide all context menus
        hideAllContextMenus();
    }

    /**
     * Checks if user selected something or not
     * @param selection
     * @returns {*}
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

    /**
     * Checks if selection contains link.
     * If yes, then change button in a toolbar.
     * @returns {string}
     */
    function checkExistingLink() {

        console.log("checkExistingLink");

        // damn IE is special!
        if (isMSIE) {
            var selection = document.selection.createRange();
            var selected_link = selection.parentElement().href;      // Get the selected link href
        }
        // all normal browsers
        else {
            var selection = window.getSelection();
            var selected_link = selection.anchorNode.parentNode.href; // Get the selected link href
        }

        // if there is a link
        if (!!selected_link) {
            if (selected_link.substring(0,24) === "javascript:window.open('") {
                selected_link = selected_link.substring(24, selected_link.length-2);
            }
            link_placeholder = selected_link;
            addClass(ToolbarElement.main_menu(), "is-link");
        } else {
            link_placeholder = "none";
            removeClass(ToolbarElement.main_menu(), "is-link");
        }

        return selected_link;
    }

    /**
     * Function that defines position of formatting tools on the screen
     * It finds the position of selected range and places toolbox next to that
     */
    var positionTools = function(){
        var oRange,
            oRect,
            selection,
            sel_width,
            sel_height,
            current_bottom_distance,
            toolbar_width = undefined,
            ratio_arrow,
            ratio_toolbar,
            dist_to_right,
            dist_to_left,
            dist_to_top,
            min_bottom_distance = 140,
            tools_height = 32;

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
            if(sel_width > 10){
                sel_width = (sel_width - 10) / 2;
                ToolbarElement.arrow_pointer().style.left = oRect.left + sel_width + "px";
            }
            else {
                ToolbarElement.arrow_pointer().style.left = "0px";
            }

            // Check if web link or email link currently selected to show different menu
            checkExistingLink();

            // FIX LATER
            var width_em = 28.688;
            var mobile_width = width_em * 16;

            // position:fixed iOS bug when keyboard is on the screen
            if (iOS) {
                dist_to_top = oRect.top + sel_height; // works on iOS
            } else {
                dist_to_top = oRect.top + window.pageYOffset + sel_height; // should work everywhere else
            }

            dist_to_top = dist_to_top + 20;

            dist_to_left = 0;

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



// Formatting tools functions
//==========================================

    /**
     * Removes underline because we doesn't allow underline in our project
     * @param selection
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

    /**
     * Toggle bold style for text
     */
    function toggleBold() {
        document.execCommand("bold", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /**
     * Toggle italic style for text
     */
    function toggleItalic() {
        document.execCommand("italic", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /**
     * Show/Hide color menu
     */
    function toggleColorMenu() {
        // Remove or add class from main menu
        if(hasClass(ToolbarElement.main_menu(), "hide-main-menu")) {
            removeClass(ToolbarElement.main_menu(), "hide-main-menu");
        } else {
            addClass(ToolbarElement.main_menu(), "hide-main-menu");
        }

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /**
     * Show/Hide color menu
     */
    function toggleParagraphMenu() {
        // Add or remove class from main menu
        // Remove color menu if needed
        if(hasClass(ToolbarElement.main_menu(), "hide-main-menu")) {
            removeClass(ToolbarElement.main_menu(), "hide-main-menu");
            setTimeout(function() { // Need timeout same long as CSS3 transition
                removeClass(ToolbarElement.color_menu(), "hide-menu");
            }, 150);
        } else {
            addClass(ToolbarElement.color_menu(), "hide-menu");
            addClass(ToolbarElement.main_menu(), "hide-main-menu");
        }
    }

    /**
     * Make Web link and backwards
     */
    function createWebLink() {
        hideAllContextMenus(); // ??

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

    /**
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

    /**
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

    /**
     * Opens web link or email link
     * @returns {boolean}
     */
    function openLink() {
        window.open(link_placeholder);
        return false;
    }

    /**
     * Accordingly changes color of selected text
     * @param color
     */
    function setColor(color) {
        document.execCommand("foreColor", false, color);

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /**
     * Applies heading type for selection
     * @param heading_type
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

    /**
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        document.execCommand("removeFormat", false, null);
        document.execCommand("unlink", false, null);

        cur_contentdiv.focus(); // return focus back to editing field
    }



// Extra functionality
//==========================================

    /**
     * Paste everything into editable div without HTML formatting
     * @param e
     */
    var makePlain = function(e) {
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



// Media functions
//==========================================

    /**
     * Event for aligning media within section
     */
    function alignMedia() {
        var elem = this.parentNode.parentNode;
        var value = window.getComputedStyle(elem, null).getPropertyValue("float");

        if (value == "right") {
            elem.style.display = "none";
            elem.style.styleFloat = "left"; // ie style
            elem.style.cssFloat   = "left"; // all rest browser style

            this.innerHTML = '<i class="fa fa-arrow-right"></i>';

            setTimeout( function(){
                elem.style.display = "";
            }, 150);
        } else {
            elem.style.display = "none";
            elem.style.styleFloat = "right"; // ie style
            elem.style.cssFloat   = "right"; // all rest browser style
            this.innerHTML = '<i class="fa fa-arrow-left"></i>';

            setTimeout( function(){
                elem.style.display = "";
            }, 150);
        }
    }

    /**
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


    /**
     * Disables scrolling on the entire page
     * @param e
     */
    function disableScrolling (e) {
        console.log("stop scrolling");
        e.preventDefault();
    }

    var prev_sum;

    /**
     * Pinch to zoom functionality
     * @type {{startResizeImg: startResizeImg, performResizeImg: performResizeImg, endResizeImg: endResizeImg}}
     */
    var pinchToZoom = {
        /*
         * Defines initial coordinates of touch
         */
        startResizeImg : function(e) {
            if (e.touches.length == 2) {
                document.addEventListener('touchmove', disableScrolling, false);

                // Set current mouse location
                var dist_x = Math.abs(e.touches[0].clientX - e.touches[1].clientX),
                    dist_y = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

                prev_sum = dist_x + dist_y;
            } else {
                // Enables scrolling after image resize
                document.removeEventListener('touchmove', disableScrolling);
            }
        },

        performResizeImg : function(e, elem) {
            var dist_x, dist_y, sum, cur_width, ratio;

            if (e.touches.length == 2) {
                // Current width of media container
                cur_width = parseFloat(elem.style.getPropertyValue("width").replace("%",""));

                dist_x = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
                dist_y = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
                sum    = dist_x + dist_y;

                // Set new ration
                ratio = Math.abs(prev_sum - sum) * 0.1;

                // Make image smaller
                if (sum < prev_sum) {
                    if (cur_width > 20) { // set minimum limit
                        cur_width = cur_width - ratio;
                        elem.style.width = cur_width + "%";
                    }
                }
                // Make image bigger
                else {
                    if (cur_width < 99) { // set maximum limit
                        cur_width = cur_width + ratio;
                        elem.style.width = cur_width + "%";
                    }
                }

                // Set current new mouse coordinates
                prev_sum = sum;
            } else {
                // Enables scrolling after image resize
                document.removeEventListener('touchmove', disableScrolling);
            }

            return false;
        },

        // Enables scrolling after image resize
        endResizeImg : function(e) {
            document.removeEventListener('touchmove', disableScrolling);
        }
    };


    /**
     * Defines initial coordinates of touch
     * @param e
     */
    function startResizeImg(e) {
        // Set current mouse location
        cur_mouse_x = e.touches[0].clientX;
        cur_mouse_y = e.touches[0].clientY;
        console.log("touch1=", "x:", cur_mouse_x, "y:", cur_mouse_y);

        var cur_mouse_x_2 = e.touches[1].clientX,
            cur_mouse_y_2 = e.touches[1].clientY;
        console.log("touch2=", "x:", cur_mouse_x_2, "y:", cur_mouse_y_2);
    }

    /**
     * Calculates how much to resize the media container and then resizes it
     * @param e
     * @param media_el
     * @param direction
     * @returns {boolean}
     */
    function performResizeImg(e, media_el, direction) {
        var dist_x, dist_y, sum, cur_width, pows, diagonal, ratio;
        e = e.touches[0]; // get coordinates from only one touch event

        // Current width of media container
        cur_width = parseFloat(media_el.style.getPropertyValue("width").replace("%",""));

        // Direction: to top right corner (-> ^)
        if (direction == "left") {
            dist_x   = e.clientX - cur_mouse_x;
            dist_y   = cur_mouse_y - e.clientY;
            sum      = dist_x + dist_y;
            pows     = Math.pow(dist_x, 2) + Math.pow(dist_y, 2);
            diagonal = Math.sqrt(pows);
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
        ratio = diagonal * 0.1;

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

    /**
     * End resize image
     * @param media_el
     */
    function endResizeImg(media_el) {
        // Find current width of media element
        var cur_width = parseFloat(media_el.style.getPropertyValue("width").replace("%",""));

        // Check if image is oversized
        if (cur_width > 99) {
            media_el.style.width = 99 + "%";
        }
        // Check if media is smaller than minimum limit
        if (cur_width < 20) {
            media_el.style.width = 20 + "%";
        }

        // Resets touch coordinates for new events
        cur_mouse_x = 0;
        cur_mouse_y = 0;
    }





//------------------------------------------
// Section functions
//------------------------------------------

    /**
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

    /**
     * Move section up or down
     * @param elem
     * @param direction
     */
    function moveSection(elem, direction, section_cls) {
        var el = elem.parentNode.parentNode.parentNode,
            par_el = el.parentNode,
            ref_el;

        if (direction == "up") {
            ref_el = prev(el, section_cls);

            if (ref_el !== null) {
                par_el.insertBefore(el, ref_el);
            }
        }
        else {
            ref_el = next(el, section_cls);

            if (ref_el !== null) {
                par_el.insertBefore(ref_el, el);
            }
        }
    }

    /**
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

    /**
     * Event for adding new media into section
     * @param elem
     * @param float
     */
    function addMedia(elem, float) {
        var btn_value = '<i class="fa fa-arrow-left"></i>', // Default button value
            parent_el = elem.parentNode.parentNode.parentNode.parentNode.getElementsByClassName(SectionElement.content_wrapper_cls)[0], // parent element
            first_child_el = parent_el.firstChild, // first child element
            media_div = document.createElement("div"); // main media container

        media_div.className = SectionElement.media_container_cls;

        media_div.style.styleFloat = float; // ie style
        media_div.style.cssFloat = float; // all rest browser style

        media_div.style.width = "30%"; // default width

        // Should change button value opposite to current state
        if (float == "left") {
            btn_value = '<i class="fa fa-arrow-right"></i>';
        }

        media_div.innerHTML = '<div class="media-options">'
            +   '<button class="align-media">'+ btn_value +'</button>'
            +   '<button class="replace-media"><i class="fa fa-undo"></i> Replace</button>'
            +   '<button class="remove-media"><i class="fa fa-trash-o"></i></button>'
            +   '<div class="resize-img-left-bot"></div>'
            +   '<div class="resize-img-right-bot"></div>'
            + '</div>'
            + '<img src="img/cat2.jpg" alt="cat"/>';

        parent_el.insertBefore(media_div, first_child_el); // insert new created container into section
        PebblePadTextEditorObj.prototype.setMediaContainerEvents(media_div); // add all necessary event listeners

        removeClass(elem.parentNode, "show"); // hide option for "add media" (left/right)
    }

    /**
     * Placeholder like native HTML5
     * @param e
     */
    function placeholder(e) {
        console.log("placeholder");
        var placeholder_el = cur_contentdiv.parentNode.getElementsByClassName("placeholder")[0];

        if (e !== "load") {
            setTimeout(function() {
                togglePlaceholder(placeholder_el);
            }, 0);
        } else {
            togglePlaceholder(placeholder_el);
        }
    }

    /**
     * Toggle placeholder
     * @param placeholder_el
     */
    function togglePlaceholder(placeholder_el) {
        if (cur_contentdiv.innerHTML.length > 0 && cur_contentdiv.innerHTML != "<br>") {
            console.log("remove here");
            removeClass(placeholder_el, "show");
        } else {
            console.log("show here");
            addClass(placeholder_el, "show");
        }
    }

    /**
     * Checks if .hover needed for section
     * @param el
     */
    function checkHover(el) {
        event.stopPropagation();

        // If current element is undefined
        // make currently active element as current element
        if (!last_section) {
            last_section = el;
        }

        // If element match current element
        if (el === last_section) {
            // Make all section buttons visible
            addClass(el, "hover");
        } else {
            // Hide buttons from previously used element
            removeClass(last_section, "hover");

            // Show all section buttons on current element
            addClass(el, "hover");

            // Updates current section element
            last_section = el;
        }
    }

    /**
     * Removes all .hover when user is outside section
     */
    function clearHover() {
        document.body.addEventListener("touchstart", function() {
            if (!!last_section) {
                removeClass(last_section, "hover");
            }
        }, false);
    }





//------------------------------------------
// Add New Section Menu functions
//------------------------------------------

//    /*
//     * "Add new section" buttons aka "Pluses"(+)
//     */
//    function addNewSectionMenu(e, location) {
//        var par_el, ref_el,
//            add_new_el = document.createElement("div");
//            add_new_el.id = "add-new-section-menu";
//            add_new_el.className = "add-new-section-menu";
//            add_new_el.innerHTML = '<button id="add-text-section"><div class="icon">+</div><div class="lbl">Text Section</div></button>'
//                                 + '<button id="add-media-section"><div class="icon">+</div><div class="lbl">Media Section</div></button>'
//                                 + '<button id="add-tbl-section"><div class="icon">+</div><div class="lbl">Table Section</div></button>'
//                                 + '<button id="close-add-section-menu">✖</button>';
//
//        add_new_section_menu = document.getElementById("add-new-section-menu");
//
//        // Remove menu if it already exists
//        if (!!add_new_section_menu) { removeAddSectionMenu(); }
//
//        if (location === "above") {
//            par_el = e.target.parentNode.parentNode;
//            ref_el = e.target.parentNode;
//            par_el.insertBefore(add_new_el, ref_el);
//        } else {
//            par_el = e.target.parentNode.parentNode.parentNode;
//            ref_el = e.target.parentNode.parentNode;
//            par_el.insertBefore(add_new_el, ref_el.nextSibling);
//        }
//
//        setTimeout(function() {
//            addClass(add_new_el, "show");
//        }, 0);
//
//        // Set focus
//        document.getElementById("add-text-section").focus();
//
//        // Add event listeners for new "Add new section" menu.
//        setEventsForAddNewSection();
//    }

//    /*
//     * Add txt section to DOM
//     */
//    function addTxtSection() {
//        var par_el = add_new_section_menu.parentNode,
//            ref_el = add_new_section_menu,
//            section_el = document.createElement("div");
//            section_el.className = cls_section + ' group';
//            section_el.innerHTML = '<button class="add-btn add-above">+</button>'
//                                 + '<div class="'+ cls_content_wrapper +'">'
//                                 + '<div class="placeholder">Start typing here...</div>'
//                                 + '<div class="'+cls_editablediv+'" contenteditable></div>'
//                                 + '</div><!-- /.'+ cls_content_wrapper +' -->'
//                                 + '<textarea name="text-editor-textarea" class="text-editor-textarea"></textarea>'
//                                 + '<div class="section-options">'
//                                 + '<div class="core-options-holder">'
//                                 + '<button class="remove-section"><i class="fa fa-trash-o"></i></button>'
//                                 + '<button class="move-sec-up"><i class="fa fa-angle-up"></i></button>'
//                                 + '<button class="move-sec-down"><i class="fa fa-angle-down"></i></button>'
//                                 + '<button class="add-media"><i class="fa fa-picture-o"></i></button>'
//                                 + '<div class="align-media-choice">'
//                                 + '<button class="add-media-left"><i class="fa fa-reply"></i></button>'
//                                 + '<button class="add-media-right"><i class="fa fa-share"></i></button>'
//                                 + '</div><!-- /.align-media-choice -->'
//                                 + '</div><!-- /.core-options-holder -->'
//                                 + '<button class="add-btn add-below">+</button>'
//                                 + '</div><!-- /.section-options -->';
//
//        ref_el.style.display = "none";
//
//        par_el.insertBefore(section_el, ref_el);
//        setSectionEventListeners(section_el); // add event listeners
//        section_el.getElementsByClassName(cls_editablediv)[0].focus();
//
//        removeAddSectionMenu();
//    }
//
//    /*
//     * Add media only section to DOM
//     */
//    function addMediaSection() {
//        console.log("add media section");
//    }
//
//    /*
//     * Add table section to DOM
//     */
//    function addTblSection() {
//        console.log("add tbl section");
//    }
//
//    /*
//     * Removes "Add new section" menu from DOM
//     */
//    function removeAddSectionMenu() {
//        removeClass(add_new_section_menu, "show");
//        add_new_section_menu.parentNode.removeChild(add_new_section_menu);
//    }


// Event listeners
//==========================================

    /**
     * Sets all event listeners for media container elements
     * @param el
     */
    PebblePadTextEditorObj.prototype.setMediaContainerEvents = function(el) {
        // Check if it's single element and convert it to array
        if (!el.length) {
            var elem = {};
            Array.prototype.push.call(elem, el);
            el = elem;
        }

//        console.log("el=", el);

        for (var i=0; el[i] !== undefined; i++) {
//            console.log("el[i]:", el[i]);
            var tap, // true if user tapper on media container
                left_resize  = el[i].getElementsByClassName("resize-img-left-bot")[0],
                right_resize = el[i].getElementsByClassName("resize-img-right-bot")[0];

            // Check if media container was tapped
            el[i].addEventListener("touchstart", function() { tap = true; }, false);
            el[i].addEventListener("touchmove", function() { tap = false; }, false);
            // Do this only if user tapped on container
            el[i].addEventListener("touchend", function() {
                // Make current item as last_media_item if it's undefined
                !last_media_item ? last_media_item = this : false;

                // If it is same item that was tapped, do below
                if (last_media_item === this) {
//                    console.log("touchEnd last_media_item");
                    tap ? toggleClass(this, "hover") : false; // add .hover to current media element
                }
                else {
                    // Remove .hover from last used item
                    removeClass(last_media_item, "hover");

                    // Add .hover to new item
                    addClass(this, "hover");

                    // Update last item
                    last_media_item = this;
                }
            }, false);

            // Add event listener for "Align media" button
            el[i].getElementsByClassName("align-media")[0].onclick = alignMedia;

            // Add event listener for "Remove media" button
            el[i].getElementsByClassName("remove-media")[0].onclick = removeMedia;

            // Resize with pinch to zoom
            el[i].addEventListener("touchstart", function(e) { pinchToZoom.startResizeImg(e); }, false);
            el[i].addEventListener("touchmove", function(e) { pinchToZoom.performResizeImg(e, this); }, false);
            el[i].addEventListener("touchend", function(e) { pinchToZoom.endResizeImg(e); }, false);

            // Resize from left bottom corner
            // left_resize.addEventListener("touchstart", function(e) { startResizeImg(e); }, false);
            // left_resize.addEventListener("touchmove", function(e) { performResizeImg(e, this.parentNode.parentNode, "left"); }, false);
            // left_resize.addEventListener("touchend", function(e) { endResizeImg(this.parentNode.parentNode); }, false);

            // Resize from right bottom corner
            // right_resize.addEventListener("touchstart", function(e) { startResizeImg(e); }, false);
            // right_resize.addEventListener("touchmove", function(e) { performResizeImg(e, this.parentNode.parentNode, "right"); }, false);
            // right_resize.addEventListener("touchend", function(e) { endResizeImg(this.parentNode.parentNode); }, false);
        }
    }

//    /*
//     * Sets all events for "Add new section" menu
//     */
//    function setEventsForAddNewSection() {
//        // 'Add new section' menu element
//        add_new_section_menu = document.getElementById("add-new-section-menu");
//
//        // All buttons within menu
//        btn_add_txt_sect     = document.getElementById("add-text-section");
//        btn_add_media_sect   = document.getElementById("add-media-section");
//        btn_add_tbl_sect     = document.getElementById("add-tbl-section");
//        cls_add_section_menu = document.getElementById("close-add-section-menu"); // close menu
//
//        // If element exists then add events
//        if (!!add_new_section_menu) {
//            btn_add_txt_sect.onclick     = addTxtSection;
//            btn_add_media_sect.onclick   = addMediaSection;
//            btn_add_tbl_sect.onclick     = addTblSection;
//            cls_add_section_menu.onclick = removeAddSectionMenu;
//        }
//    }

//    /*
//     * This function was created due to the closure inside the loops
//     */
//    function setSectionEventListeners(el) {
//        var add_section_above,  // (+) add new section above button
//            add_section_below,  // (+) add new section below button
//
//            content_div,        // section container itself
//            btn_rmv_section,    // remove section button
//            btn_move_sec_up,    // move section up button
//            btn_move_sec_down,  // move section down button
//            btn_add_media,      // add new media
//            btn_add_med_left,   // adds media on the left
//            btn_add_med_right;  // adds media on the right
//
//        // Check if it's single element and convert it to array
//        if (!el.length && !!el) {
//            var elem = {};
//            Array.prototype.push.call(elem, el);
//            el = elem;
//        }
//
//        // Loop through each 'text editor content' element and add event listeners
//        for(var i = 0; el[i] !== undefined; i++) {
//            add_section_above = el[i].getElementsByClassName("add-above")[0],
//            add_section_below = el[i].getElementsByClassName("add-below")[0],
//
//            content_div       = el[i].getElementsByClassName(cls_editablediv)[0],
//            btn_rmv_section   = el[i].getElementsByClassName("remove-section")[0]
//            btn_move_sec_up   = el[i].getElementsByClassName("move-sec-up")[0],
//            btn_move_sec_down = el[i].getElementsByClassName("move-sec-down")[0];
//            btn_add_media     = el[i].getElementsByClassName("add-media")[0];
//            btn_add_med_left  = el[i].getElementsByClassName("add-media-left")[0];
//            btn_add_med_right = el[i].getElementsByClassName("add-media-right")[0];
//            cur_contentdiv    = content_div; // sets current editable div element
//
//
//            // Run placeholder right after load
//            content_div.addEventListener("load",  placeholder(),  false);
//
//            // Show or hide placeholder within section
//            content_div.addEventListener("keydown", placeholder, false); // ??
//
//            // Put all date into textarea right after load
//            content_div.addEventListener("load",  updateTextarea(el[i]),  false);
//
//            // Apply changes to main container after focus
//            content_div.addEventListener("focus", function(el){
//                return function() {
//                    // Update current editable div to indicate working element
//                    cur_contentdiv = el.getElementsByClassName(cls_editablediv)[0]; // sets current editable div element
//
//                    // Add .hover for main container when in focus
//                    checkHover(el);
//
//                    // Check if need to show editing toolbar
//                    if(sel_type==="Range"){ showTools(); }
//
//                    // Ability to get selection. Fix for touch devices.
//                    timer = setInterval(positionTools, 150);
//                };
//            }(el[i]), false);
//
//            // Make possible to paste plain text
//            content_div.addEventListener("paste", pastePlain,    false);
//
//            /* Place formatting tools */
//            // Touch events ??
//            content_div.addEventListener("touchstart", function() { positionTools; }, false);
//            content_div.addEventListener("touchmove", function() { positionTools; }, false);
//            content_div.addEventListener("touchend", function() { positionTools; }, false);
//
//            el[i].addEventListener("touchstart", function(el) {
//                return function() {
//                    checkHover(el);
//                }
//            }(el[i]), false);
//
//            // Show formatting tools when Scroll and move with the content
//            document.addEventListener("scroll", function() {
//                if(sel_type === "Range") { positionTools(); } }, false); // ??
//
//
//            // Saves all data into textarea.
//            // Hides editing tools when out of editing element focus.
//            content_div.addEventListener("blur", function(el) {
//                return function() {
//                    // Remove .hover for main container when in blur
//                    checkHover(el);
//
//                    // Updates textarea for back-end submition
//                    updateTextarea(el);
//
//                    // Defines whether user selected text or not
//                    sel_type = checkSelectionType(window.getSelection());
//                    if(sel_type === "None" || sel_type === "Caret") { hideTools(); }
//
//                    // Clears timer variable when not in use
//                    clearInterval(timer);
//
//                };
//            }(el[i]), false);
//
//            /* Section actions */
//            // Sets event listener for "Add new section" buttons aka "Pluses"(+)
//            add_section_above.onclick = function(e) { addNewSectionMenu(e, "above"); }
//            add_section_below.onclick = function(e) { addNewSectionMenu(e, "below"); }
//
//            // Event listener to remove section
//            btn_rmv_section.onclick = removeSection;
//
//            // Event to toggle "Add media" menu
//            btn_add_media.onclick = toggleMediaMenu;
//
//            // Event to insert media into section
//            btn_add_med_left.addEventListener("click", function(){ addMedia(this, "left"); }, false);
//            btn_add_med_right.addEventListener("click", function(){ addMedia(this, "right"); }, false);
//
//            // Move section up/down
//            btn_move_sec_up.addEventListener("click", function(){ moveSection(this, "up"); }, false);
//            btn_move_sec_down.addEventListener("click", function(){ moveSection(this, "down"); }, false);
//        }
//    }

    /**
     * Sets actions for all toolbar buttons
     * @param list_of_tools
     */
    PebblePadTextEditorObj.prototype.setToolbar = function(list_of_tools) {

        // Container with all toolbar buttons
        var buttons_container_elem = document.createElement("div");
        buttons_container_elem.id = "buttons-container";
        buttons_container_elem.className = "buttons-container group";

        // Container only for main menu toolbar buttons (top level of menu e.g. "bold", "italic", "color", "web-link"...)
        var main_menu_elem = document.createElement("div");
        main_menu_elem.id = "main-menu";
        main_menu_elem.className = "main-menu group";

        // Holder for main menu buttons (critical for mobile horizontal scrolling)
        var main_menu_buttons = '';

        // Detectors to avoid duplication of menu items
        var link_is_set      = false; // detect when link was set
            color_is_set     = false; // detect if color sub-menu needed
            paragraph_is_set = false; // detect if paragraph sub-menu needed

        // Loop though each needed item in a list of tools and add this item to main menu
        for(var i=0; i < list_of_tools.length; i++) {
            switch(list_of_tools[i])
            {
                case "bold":
                    main_menu_buttons += '<button id="toggle-bold"><i class="fa fa-bold"></i></button>'; // bold
                    break;

                case "italic":
                    main_menu_buttons += '<button id="toggle-italic"><i class="fa fa-italic"></i></button>'; // italic
                    break;

                case "color":
                    main_menu_buttons += '<button id="toggle-color-menu"><i class="fa fa-th"></i></button>'; // color
                    color_is_set = true;
                    break;

                case "paragraph":
                    main_menu_buttons += '<button id="toggle-paragraph-menu"><i class="fa fa-text-height"></i></button>'; // paragraph
                    paragraph_is_set = true;
                    break;

                case "web link":
                    // Set additional buttons for link
                    if (!link_is_set) {
                        main_menu_buttons += '<button id="edit-link"><i class="fa fa-edit"></i></button>'; // edit link
                        main_menu_buttons += '<button id="open-link"><i class="fa fa-globe"></i></button>'; // open link
                        link_is_set = true;
                    }
                    main_menu_buttons += '<button id="toggle-web-link"><i class="fa fa-link"></i></button>'; // web link
                    break;

                case "email link":
                    // Set additional buttons for link
                    if (!link_is_set) {
                        main_menu_buttons += '<button id="edit-link"><i class="fa fa-edit"></i></button>'; // edit link
                        main_menu_buttons += '<button id="open-link"><i class="fa fa-globe"></i></button>'; // open link
                        link_is_set = true;
                    }
                    main_menu_buttons += '<button id="toggle-email-link"><i class="fa fa-paperclip"></i></button>'; // email link
                    break;

                case "plain":
                    main_menu_buttons += '<button id="remove-formatting"><i class="fa fa-undo"></i></button>'; // plain
                    break;

                default:
                    console.log("unknown toolbar button");
                    break;
            }
        }

        // Add content to main menu
        main_menu_elem.innerHTML = '<div id="main-menu-buttons" class="main-menu-buttons group">' + main_menu_buttons + '</div>';

        // Add main menu container to buttons' holder element
        buttons_container_elem.appendChild(main_menu_elem);

        // Add color sub menu if needed
        if(color_is_set) {
            var color_sub_menu = document.createElement("div");
            color_sub_menu.id = "color-menu";
            color_sub_menu.className = "color-menu group";

            // Color sub menu
            color_sub_menu.innerHTML = '<button id="back-main-from-color" class="back-to-main"><i class="fa fa-arrow-up"></i></button>'+
                '<div class="sub-menu-holder">'+
                '<div class="sub-menu-container">'+
                '<button id="color-red" class="color-pick"></button>'+
                '<button id="color-green" class="color-pick"></button>'+
                '<button id="color-blue" class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '<button class="color-pick"></button>'+
                '</div>'+
                '</div>';

            // Add color sub menu
            buttons_container_elem.appendChild(color_sub_menu);
        }

        // Add paragraph sub menu if needed
        if(paragraph_is_set) {
            var paragraph_sub_menu = document.createElement("div");
            paragraph_sub_menu.id = "paragraph-menu";
            paragraph_sub_menu.className = "paragraph-menu group";

            // Paragraph sub menu
            paragraph_sub_menu.innerHTML = '<button id="back-main-from-paragraph" class="back-to-main"><i class="fa fa-arrow-up"></i></button>'+
                '<div class="sub-menu-holder">'+
                '<div class="sub-menu-container">'+
                '<button id="toggle-heading-h1">Heading 1</button>'+
                '<button id="toggle-heading-h2">Heading 2</button>'+
                '<button id="toggle-heading-h3">Fake heading 3</button>'+
                '</div>'+
                '</div>';

            // Add parahrahp sub menu
            buttons_container_elem.appendChild(paragraph_sub_menu);
        }

        var buttons_container_el = ToolbarElement.buttons_container();
        if(buttons_container_el) {
            buttons_container_el.parentNode.removeChild(buttons_container_el);
        }
        // Place toolbar elements into DOM
        ToolbarElement.toolbar().appendChild(buttons_container_elem);

        // Reset for event listeners
        link_is_set = false;

        // Fast click for all touch devices to fix 300ms delay on click
        var fastClickButtons = ToolbarElement.toolbar().getElementsByTagName("button"); // Array with all toolbar buttons

        for (var n=0; n < fastClickButtons.length; n++) { // Loop through every button and add it to FastClick object
            new FastClick(fastClickButtons[n]);
        }

        for(var i=0; i < list_of_tools.length; i++) {
            switch(list_of_tools[i])
            {
                case "bold":
                    ToolbarElement.bold().addEventListener("click", toggleBold, false);
                    break;
                case "italic":
                    ToolbarElement.italic().addEventListener("click", toggleItalic, false);
                    break;
                case "color":
                    ToolbarElement.color_toggle().addEventListener("click", toggleColorMenu, false);
                    ToolbarElement.color_red().addEventListener("click", function(){ setColor("red") }, false);
                    ToolbarElement.color_green().addEventListener("click", function(){ setColor("green") }, false);
                    ToolbarElement.color_blue().addEventListener("click", function(){ setColor("blue") }, false);
                    ToolbarElement.back_from_color().addEventListener("click", toggleColorMenu, false);
                    break;
                case "paragraph":
                    ToolbarElement.paragraph_toggle().addEventListener("click", toggleParagraphMenu, false);
                    ToolbarElement.h1().addEventListener("click", function(){ toggleHeading("h1"); }, false);
                    ToolbarElement.h2().addEventListener("click", function(){ toggleHeading("h2"); }, false);
                    ToolbarElement.back_from_paragraph().addEventListener("click", toggleParagraphMenu, false);
                    break;
                case "web link":
                    // Set additional buttons for link
                    if (!link_is_set) {
                        ToolbarElement.open_link().addEventListener("click", function(){ openLink(); }, false);
                        ToolbarElement.edit_link().addEventListener("click", function(){ editLink(); }, false);
                        link_is_set = true;
                    }
                    ToolbarElement.web_link().addEventListener("click", function(){ createWebLink(); }, false);
                    break;
                case "email link":
                    // Set additional buttons for link
                    if (!link_is_set) {
                        ToolbarElement.open_link().addEventListener("click", function(){ openLink(); }, false);
                        ToolbarElement.edit_link().addEventListener("click", function(){ editLink(); }, false);
                        link_is_set = true;
                    }
                    ToolbarElement.email_link().addEventListener("click", function(){ createEmailLink(); }, false);
                    break;
                case "plain":
                    ToolbarElement.plain().addEventListener("click", function(){ removeFormatting(); }, false);
                    break;
                default:
                    console.log("unknown toolbar button event");
                    break;
            }
        }

//
//        // Toolbar buttons and their actions
//        toolbar.bold.addEventListener("click", toggleBold,   false);
//        toolbar.italic.addEventListener("click", toggleItalic, false);
//
//        toolbar.color_menu.addEventListener("click", toggleColorMenu, false);
//        toolbar.color_red.addEventListener("click", function(){ setColor("red") }, false);
//        toolbar.color_green.addEventListener("click", function(){ setColor("green") }, false);
//        toolbar.color_blue.addEventListener("click", function(){ setColor("blue") }, false);
//        toolbar.back_from_color.addEventListener("click", toggleColorMenu, false);
//
//        toolbar.paragraph.addEventListener("click", toggleParagraphMenu, false);
//        toolbar.h1.addEventListener("click", function(){ toggleHeading("h1"); }, false);
//        toolbar.h2.addEventListener("click", function(){ toggleHeading("h2"); }, false);
//        toolbar.back_from_paragraph.addEventListener("click", toggleParagraphMenu, false);
//
//        toolbar.web_link.addEventListener("click", function(){ createWebLink(); }, false);
//        toolbar.email_link.addEventListener("click", function(){ createEmailLink(); }, false);
//        toolbar.edit_link.addEventListener("click", function(){ editLink(); }, false);
//        toolbar.open_link.addEventListener("click", function(){ openLink(); }, false);
//
//        toolbar.plain.addEventListener("click", function(){ removeFormatting(); }, false);
    }



// Application Init
//==========================================

    // Add ability to click on links within editable divs
//    document.addEventListener("DOMContentLoaded", clickOnLinks());
    // run code to clear .hover class from sections when touch outside sections
    clearHover();
    return (window.PebblePadTextEditor = PebblePadTextEditor);

//    window.PebbleEditor = (function()
//    {
//        var _init = false, app = {};
//
//        app.init = function() {
//            // Exit function if it's already running
//            if (_init) { return; }
//
//            // Indicate that function is running
//            _init = true;
//
//            // Add all events after initiall run
//            setSectionEventListeners(section_container);
//            setEventsForMediaContainer(media_container);
//            setToolbar();
//            clearHover();
//        };
//
//        return app;
//
//    })();

//    // Run this script only when content is loaded and addEventListener is suppported by the browser
//    if (window.addEventListener) {
//        window.addEventListener('DOMContentLoaded', window.PebbleEditor.init(), false);
//    }

})(window, document);