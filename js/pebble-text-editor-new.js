/* 
 * Pebble Text Editor
 * Copyright @ Pebble Learning
 */
;




(function(window, document, undefined){ // ============ DESKTOP
//------------------------------------------
// All variables defined here
//------------------------------------------

    // Helpers, Globals
    var cur_contentdiv,                 // current section element
        last_used_list_of_tools,        // List of tools that been used last
        cur_mouse_x, cur_mouse_y,       // image resizing data
        sel_type         = "Caret",     // variable to store type of selection: caret or range
        show_menu_class  = "show-menu", // class for making visible the context menus
        is_in_focus      = false,       // make editing tools working only inside input that is in focus
        is_italic        = false,       // variable for removing extra formatting from any of paragraphs
        link_placeholder = "none";      // is a placeholder for input field when create a web/email link

    // All toolbar elements stored in this object
    var ToolbarElement = {
        // Toolbar container
        toolbar_div     : document.createElement("div"),
        init_toolbar_el : function() {
            this.toolbar_div.id = "toolbar";
            this.toolbar_div.className = "toolbar group";
            this.toolbar_div.innerHTML = '<div id="arrow-pointer" class="arrow-pointer"></div>';
            document.body.insertBefore(this.toolbar_div, document.body.firstChild);
        },

        // Toolbar UI elements
        toolbar          : function() { return document.getElementById("toolbar") },           // toolbar container itself
        buttons_container: function() { return document.getElementById("buttons-container") }, // main buttons holder
        main_menu        : function() { return document.getElementById("main-menu") },         // main menu
        color_menu       : function() { return document.getElementById("color-menu") },        // context menu that holds color pallete
        paragraph_menu   : function() { return document.getElementById("paragraph-menu") },    // context menu that holds heading/paragraph styles
        buttons_wrapper  : function() { return document.getElementById("buttons-container") }, // all button holder
        arrow_pointer    : function() { return document.getElementById("arrow-pointer") },     // arrow icon that pointing on selection

        // Toolbar elements options
        bold        : function() { return document.getElementById('toggle-bold') },
        italic      : function() { return document.getElementById('toggle-italic') },
        
        color_toggle: function() { return document.getElementById("toggle-color-menu") },
        color_red   : function() { return document.getElementById("color-red") },
        color_green : function() { return document.getElementById("color-green") },
        color_blue  : function() { return document.getElementById("color-blue") },

        paragraph_toggle: function() { return document.getElementById("toggle-paragraph-menu") },
        h1          : function() { return document.getElementById("toggle-heading-h1") },
        h2          : function() { return document.getElementById("toggle-heading-h2") },

        web_link    : function() { return document.getElementById("toggle-web-link") },
        email_link  : function() { return document.getElementById("toggle-email-link") },
        edit_link   : function() { return document.getElementById("edit-link") },
        open_link   : function() { return document.getElementById("open-link") },

        plain       : function() { return document.getElementById("remove-formatting") }
    }

    // All section UI elements stored here
    var SectionElement = {
        /*
         * List of used classes.
         * If you rename default classes in HTML&CSS,
         * REMEMBER to rename them here as well
         */
        editablediv_cls     : "text-editor-content", // contenteditable div with content
        content_wrapper_cls : "editor-content-wrapper", // container with content (text, media, placeholder)
        media_container_cls : "media-container", // container for media and media options

        media_container : function() {
            return document.getElementsByClassName(this.media_container_cls)[0]
        }, // media container
    
        // 'Add new section' menu elements
        add_new_section_menu : '', // main container
        cls_add_section_menu : '', // close menu button
        btn_add_txt_sect : '',     // add new text section
        btn_add_media_sect : '',   // add new media section
        btn_add_tbl_sect : ''      // add new table section
    }


    var BlottoEditor = function(option) {
        return new BlottoEditorObj(option);
    }

    var BlottoEditorObj = function(option) {
        option = option || {};
        option.params = option.params || {};
        option.section_class = option.section_class || "editor-section";
        option.is_single = option.is_single || false;
        option.toolbar_include = option.toolbar_include || "default";
        option.toolbar_exclude = option.toolbar_exclude || "default";

        this.section_cls = option.section_class; // section (core element)
        this.section_element = document.getElementsByClassName(this.section_cls); // section container
        this.cur_contentdiv; // current section element
        this.list_of_tools = ["bold", "italic", "color", "paragraph", "web link", "email link", "plain"]; // main list of tools
        ToolbarElement.init_toolbar_el();

        /*
         * Creates new list of tools for particular section
         */
        this.define_list_of_tools = function() {
            // Do this if for including tools
            if (option.toolbar_include !== "default") {
                this.list_of_tools = option.toolbar_include;
            } // end if include

            // Do this if for excluding tools from main array
            if (option.toolbar_include === "default" && option.toolbar_exclude !== "default") {
                // Find match and remove item from main array
                for(var i=0; i < option.toolbar_exclude.length; i++) {
                    for(var n=0; n < this.list_of_tools.length; n++) {
                        if(option.toolbar_exclude[i] === this.list_of_tools[n]) {
                            this.list_of_tools.splice(n, 1); // remove matched item from main array
                        }
                    }
                }
            } // end if exclude
        };
        this.define_list_of_tools();





        //------------------------------------------
        // _Add New Section Menu functions
        //------------------------------------------

        /*
         * Add txt section to DOM
         */
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

        /*
         * Add media only section to DOM
         */
        this.addMediaSection = function(section_cls) {
            console.log("add media section");
        }

        /*
         * Add table section to DOM
         */
        this.addTblSection = function(section_cls) {
            console.log("add tbl section");
        }





        //------------------------------------------
        // _Add New Section Menu functions
        //------------------------------------------

        /*
         * "Add new section" buttons aka "Pluses"(+)
         */
        this.addNewSectionMenu = function(e, location) {
            var par_el, ref_el,
                add_new_el = document.createElement("div");
                add_new_el.id = "add-new-section-menu";
                add_new_el.className = "add-new-section-menu";
                add_new_el.innerHTML = '<button id="add-text-section"><div class="icon">+</div><div class="lbl">Text Section</div></button>'
                                     + '<button id="add-media-section"><div class="icon">+</div><div class="lbl">Media Section</div></button>'
                                     + '<button id="add-tbl-section"><div class="icon">+</div><div class="lbl">Table Section</div></button>'
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

        /*
         * Removes "Add new section" menu from DOM
         */
        this.removeAddSectionMenu = function() {
            removeClass(SectionElement.add_new_section_menu, "show");
            SectionElement.add_new_section_menu.parentNode.removeChild(SectionElement.add_new_section_menu);
        }





        //------------------------------------------
        // _Event listeners
        //------------------------------------------

        /*
         * Sets all events for "Add new section" menu
         */
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

        /*
         * This function was created due to the closure inside the loops
         */
        this.setSectionEvents = function(el) {
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

                add_section_above = el[i].getElementsByClassName("add-above")[0],
                add_section_below = el[i].getElementsByClassName("add-below")[0],
                
                content_div       = el[i].getElementsByClassName(SectionElement.editablediv_cls)[0],
                btn_rmv_section   = el[i].getElementsByClassName("remove-section")[0]
                btn_move_sec_up   = el[i].getElementsByClassName("move-sec-up")[0],
                btn_move_sec_down = el[i].getElementsByClassName("move-sec-down")[0];
                btn_add_media     = el[i].getElementsByClassName("add-media")[0];
                btn_add_med_left  = el[i].getElementsByClassName("add-media-left")[0];
                btn_add_med_right = el[i].getElementsByClassName("add-media-right")[0];
                cur_contentdiv    = content_div; // sets current editable div element


                // Run placeholder right after load
                content_div.addEventListener("load",  placeholder,  false);

                // Show or hide placeholder within section
                content_div.addEventListener("keydown", placeholder, false);
                
                // Put all date into textarea right after load
                content_div.addEventListener("load",  updateTextarea(el[i]),  false);

                // Apply changes to main container after focus
                content_div.addEventListener("focus", function(el, list_of_tools){
                    return function() {
                        // Create new toolbar only if it wasn't created previously (performance repaint reason)
                        if(last_used_list_of_tools !== list_of_tools) {
                            BlottoEditorObj.prototype.setToolbar(list_of_tools); // create toolbar
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
                    };
                }(el[i], this.list_of_tools), false);

                // Make possible to paste plain text
                content_div.addEventListener("paste", makePlain,    false);
                
                // Disable dragging text for editable area
                content_div.addEventListener("drop",  makePlain,    false);

                /* Place formatting tools */
                // React on mouse move within content element
                content_div.addEventListener("mousemove", function() {
                    if(is_in_focus === true) { positionTools(); } }, false);

                // React on mouse move within tools container
                ToolbarElement.toolbar().addEventListener("mousemove", function() {
                    if(is_in_focus === true) { positionTools(); } }, false);

                // Show formatting tools when SELECTED with MOUSE
                content_div.addEventListener("mouseup", positionTools, false);

                // Show formatting tools when SELECTED with KEYBOARD
                content_div.addEventListener("keyup", positionTools, false);

                // Show formatting tools when Scroll and move with the content
                document.addEventListener("scroll", function() {
                    if(sel_type === "Range") { positionTools(); } }, false);

                // Saves all data into textarea.
                // Hides editing tools when out of editing element focus.
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
                    };
                }(el[i]), false);

                /* Section actions */
                // Sets event listener for "Add new section" buttons aka "Pluses"(+)
                var current_obj = this; // define current object to use within event listeners

                add_section_above.onclick = function(e) { current_obj.addNewSectionMenu(e, "above"); }
                add_section_below.onclick = function(e) { current_obj.addNewSectionMenu(e, "below"); }

                // Event listener to remove section
                btn_rmv_section.onclick = removeSection;

                // Event to toggle "Add media" menu
                btn_add_media.onclick = toggleMediaMenu;

                // Event to insert media into section
                btn_add_med_left.addEventListener("click", function(){ addMedia(this, "left"); }, false);
                btn_add_med_right.addEventListener("click", function(){ addMedia(this, "right"); }, false);

                // Move section up/down
                btn_move_sec_up.addEventListener("click", function(){ moveSection(this, "up", current_obj.section_cls); }, false);
                btn_move_sec_down.addEventListener("click", function(){ moveSection(this, "down", current_obj.section_cls); }, false);
            }
        }


        //------------------------------------------
        // Init
        //------------------------------------------

        /*
         * All that required for initial run
         */
        this.init = function() {
            this.setSectionEvents(this.section_element);
            this.setMediaContainerEvents(SectionElement.media_container());
            // this.setToolbar(this.list_of_tools);
        }

        // Initial run
        this.init();
    }






//------------------------------------------
// Helper functions
//------------------------------------------

    /*
     * Checks if element has particular class
     */
    function hasClass(element, class_name) {
        if(!!element && !!element) {
            return element.className.match(new RegExp('(\\s|^)' + class_name + '(?!\S)'));
        }
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
     * Finds previous element of same kind in a DOM
     * @el - currently selected element
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

    /*
     * Finds next element of same kind in a DOM
     * @el - currently selected element
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
        hideContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle());     // hide color menu
        hideContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle());  // hide paragraph menu
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

        textarea.value = content; // place content into textarea
    }

    /*
     * Show formatting tools
     *
     * @top defines coordinates of bottom line of selection
     * @left defines starting point of selection from left side
     */
    function showTools(top, left) {
        ToolbarElement.toolbar().style.top = top + "px";       // Locate tools
        ToolbarElement.toolbar().style.left = left + "px";     // below the selection
        addClass(ToolbarElement.toolbar(), "show-tools");      // Adding class to make tools visible
    }

    /*
     * Hide formatting tools
     */
    function hideTools() {
        removeClass(ToolbarElement.toolbar(), "show-tools");   // Removes class to hide tools
        
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

        // For normal browsers
        if(selection.type) {
            selection_type = selection.type;
        }
        
        // For IE
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
            addClass(ToolbarElement.main_menu(), "is-link");
        } else {
            link_placeholder = "none";
            removeClass(ToolbarElement.main_menu(), "is-link");
        }

        return selected_link;
    }

    /*
     * Function that defines position of formatting tools on the screen.
     * It finds the position of selected range and places toolbox next to that.
     */
    var positionTools = function() {
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
            
            // Width of toolbar
            toolbar_width = document.getElementById("main-menu-buttons").offsetWidth;

            dist_to_right = window.innerWidth - oRect.left;
            dist_to_left = oRect.left;

            // Moves arrow pointer in the middle of selection
            if(sel_width > 10) {
                // Center toolbar if selection is wider than toolbar
                if(sel_width > toolbar_width) {
                    // Set arrow in the middle of the tools
                    ratio_arrow = (toolbar_width - 10) / 2;
                    ToolbarElement.arrow_pointer().style.marginLeft = ratio_arrow + "px";

                    // Set toolbar in the middle of selection
                    ratio_toolbar = (sel_width / 2) - (toolbar_width / 2);
                    ToolbarElement.toolbar().style.marginLeft = ratio_toolbar + "px";
                } else {
                    // Set arrow in the middle of selection
                    ratio_arrow = (sel_width - 10) / 2;
                    ToolbarElement.arrow_pointer().style.marginLeft = ratio_arrow + "px";
                    
                    // Set 
                    ToolbarElement.toolbar().style.marginLeft = 0 + "px";
                }
            }
            else {
                ToolbarElement.arrow_pointer().style.marginLeft = "0px";
            }

            // Check if web link or email link currently selected to show different menu
            checkExistingLink();


            // Show tools normally before user riches bottom side of the browser
            if (current_bottom_distance > min_bottom_distance) {
                ToolbarElement.toolbar().insertBefore(ToolbarElement.arrow_pointer(), ToolbarElement.buttons_wrapper()); // put arrow pointer on top
                removeClass(ToolbarElement.color_menu(), "located-reverse");
                removeClass(ToolbarElement.paragraph_menu(), "located-reverse");
                removeClass(ToolbarElement.arrow_pointer(), "arrow-pointer-bottom");

                showTools(oRect.top + sel_height, dist_to_left); // place tools below selection
            }
            // Reverse tools, when rich bottom side of the browser
            else {
                ToolbarElement.toolbar().appendChild(ToolbarElement.arrow_pointer());
                addClass(ToolbarElement.color_menu(), "located-reverse");
                addClass(ToolbarElement.paragraph_menu(), "located-reverse");
                addClass(ToolbarElement.arrow_pointer(), "arrow-pointer-bottom");
                
                showTools(oRect.top - tools_height, dist_to_left); // place tools above selection
            }
        }

        // Hide tools when not used
        else {
            hideTools();
        }
    }






//------------------------------------------
// Formating tools functions
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

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Make text italic and backwards
     */
    function toggleItalic() {
        hideAllContextMenus();

        document.execCommand("italic", false, null);
        
        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleColorMenu() {
        // Close other menus.
        hideContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle()); // close paragraph menu

        if(hasClass(ToolbarElement.color_menu(), show_menu_class)) {
            hideContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle());
        } else {
            showContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle());
        }
        
        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Show/Hide color menu
     */
    function toggleParagraphMenu() {
        // Close other menus
        hideContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle()); // close color menu

        // Toggle menu with heading/paragraph styles 
       if(hasClass(ToolbarElement.paragraph_menu(), show_menu_class)) {
            hideContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle());
        } else {
            showContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle());
        }
        
        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Make Web link and backwards
     */
    function createWebLink() {
        hideAllContextMenus();

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
            document.execCommand("unlink", false, null); // removes previously existing link
            document.execCommand("createLink", false, url);
            checkExistingLink();
        }

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Make email link and backwards
     */
    function createEmailLink() {
        hideAllContextMenus();

        var stop = true;

        if (link_placeholder == "none") {
            link_placeholder = "";
        }

        while(stop) {
            var email = prompt("Please enter email link (e.g.: name@domain.co.uk)", link_placeholder);
            // If NOT null and NOT valid
            if(validateEmail(email)) {
                stop = false;
                document.execCommand("unlink", false, null); // removes previously existing link
                email = "mailto:" + email;
                email = "javascript:window.open('" + email + "')";
                document.execCommand("createLink", false, email);
                checkExistingLink();
            }
            if(!email && email !== "") {
                stop = false;
            }
        }

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Make Web link and backwards
     */
    function editLink() {
        hideAllContextMenus();

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
                    
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                } else {
                    link_placeholder = link;
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
                        link_placeholder = link;
                    }
                }
                // If it is a link
                if (link.substring(0,7) === "http://") {
                    document.execCommand("unlink", false, null);    // removes previously existing link
                    document.execCommand("createLink", false, link);

                    stop = false; // exit close prompt
                } else {
                    link_placeholder = link;
                }
            }
            // Exit close prompt if CANCEL was pressed
            else {
                stop = false;
            }
        }

        cur_contentdiv.focus(); // return focus back to editing field
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
        hideContextMenu(ToolbarElement.color_menu(), ToolbarElement.color_toggle()); // close color menu when done

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
        hideContextMenu(ToolbarElement.paragraph_menu(), ToolbarElement.paragraph_toggle()); // close paragraph menu when done

        cur_contentdiv.focus(); // return focus back to editing field
    }

    /*
     * Removes all the formatting. Convert everything into plain text.
     */
    function removeFormatting() {
        hideAllContextMenus();

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
        BlottoEditorObj.prototype.setMediaContainerEvents(media_div); // add all necessary event listeners

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





//------------------------------------------
// Event listeners
//------------------------------------------

    /*
     * Sets all event listeners for media container elements
     * @el - elements or set of elements
     */
    BlottoEditorObj.prototype.setMediaContainerEvents = function(el) {
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
     * Sets actions for all toolbar buttons
     */
    BlottoEditorObj.prototype.setToolbar = function(list_of_tools) {
        console.log("setToolbar:", list_of_tools);

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

        // Detecters to avoid duplication of menu items
        var link_is_set      = false; // detect when link was set
            color_is_set     = false; // detect if color sub-menu needed
            paragraph_is_set = false; // detect if paragraph sub-menu needed

        // Loop though each needed item in a list of tools and add this item to main menu
        for(var i=0; i < list_of_tools.length; i++) {
            switch(list_of_tools[i])
            {
                case "bold":
                    main_menu_buttons += '<button id="toggle-bold">Bold</button>';
                    break;

                case "italic":
                    main_menu_buttons += '<button id="toggle-italic">Italic</button>';
                    break;

                case "color":
                    main_menu_buttons += '<button id="toggle-color-menu">Color</button>';
                    color_is_set = true;
                    break;

                case "paragraph":
                    main_menu_buttons += '<button id="toggle-paragraph-menu">Paragraph</button>';
                    paragraph_is_set = true;
                    break;

                case "web link":
                    main_menu_buttons += '<button id="toggle-web-link">Web Link</button>';
                    // Set additional buttons for link
                    if (!link_is_set) {
                        main_menu_buttons += '<button id="edit-link">Edit Link</button>';
                        main_menu_buttons += '<button id="open-link">Open Link</button>';
                    } else {
                        link_is_set = true;
                    }
                    break;

                case "email link":
                    main_menu_buttons += '<button id="toggle-email-link">Email Link</button>';
                    // Set additional buttons for link
                    if (!link_is_set) {
                        main_menu_buttons += '<button id="edit-link">Edit Link</button>';
                        main_menu_buttons += '<button id="open-link">Open Link</button>';
                    } else {
                        link_is_set = true;
                    }
                    break;

                case "plain":
                    main_menu_buttons += '<button id="remove-formatting">Plain</button>';
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
                    break;
                case "paragraph":
                    ToolbarElement.paragraph_toggle().addEventListener("click", toggleParagraphMenu, false);
                    ToolbarElement.h1().addEventListener("click", function(){ toggleHeading("h1"); }, false);
                    ToolbarElement.h2().addEventListener("click", function(){ toggleHeading("h2"); }, false);
                    break;
                case "web link":
                    ToolbarElement.web_link().addEventListener("click", function(){ createWebLink(); }, false);
                    // Set additional buttons for link
                    if (!link_is_set) {
                        ToolbarElement.email_link().addEventListener("click", function(){ createEmailLink(); }, false);
                        ToolbarElement.edit_link().addEventListener("click", function(){ editLink(); }, false);
                    } else {
                        link_is_set = true;
                    }
                    break;
                case "email link":
                    ToolbarElement.email_link().addEventListener("click", function(){ createEmailLink(); }, false);
                    // Set additional buttons for link
                    if (!link_is_set) {
                        ToolbarElement.email_link().addEventListener("click", function(){ createEmailLink(); }, false);
                        ToolbarElement.edit_link().addEventListener("click", function(){ editLink(); }, false);
                    } else {
                        link_is_set = true;
                    }
                    break;
                case "plain":
                    ToolbarElement.plain().addEventListener("click", function(){ removeFormatting(); }, false);
                    break;
                default:
                    console.log("unknown toolbar button event");
                    break;
            }
        }
    }





//------------------------------------------
// Application Init
//------------------------------------------


    return (window.BlottoEditor = BlottoEditor);

})(window, document);