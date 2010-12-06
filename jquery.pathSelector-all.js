// This is a adapted version of plugin by Cory S.N. LaViska for using in Path Selector.
//
// Changes by Victor Hugo Herrera Maldonado.
//
// *****************************
// ****** Original License *****
// jQuery Context Menu Plugin
//
// Version 1.00
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// Visit http://abeautifulsite.net/notebook/80 for usage and more information
//
// Terms of Use
//
// This software is licensed under a Creative Commons License and is copyrighted
// (C)2008 by Cory S.N. LaViska.
//
// For details, visit http://creativecommons.org/licenses/by/3.0/us/
//
if(jQuery)( function() {
    $.extend($.fn, {

        contextMenu: function(o, callback) {
            // Defaults
            if( o.menu == undefined ) return false;
            if( o.inSpeed == undefined ) o.inSpeed = 50;
            if( o.outSpeed == undefined ) o.outSpeed = 75;
            // 0 needs to be -1 for expected results (no fade)
            if( o.inSpeed == 0 ) o.inSpeed = -1;
            if( o.outSpeed == 0 ) o.outSpeed = -1;
            // Loop each context menu
            $(this).each( function() {
                var el = $(this);

                var menu;
                var isString=(typeof o.menu == "string" || o.menu instanceof String);
                if(isString){
                    menu = $('#' + o.menu);
                }else{
                    menu = $(o.menu);
                }

                var offset = $(el).offset();
                // Add contextMenu class
                menu.addClass('contextMenu');
                menu.get(0).menuShown=o.menuShown;
                $(this).click( function(e) {
                        var srcElement = $(this);
                        $(this).unbind('mouseup');
                            // Hide context menus that may be showing
                            $(".contextMenu").hide("normal", o.afterHiding);
                            // Get this context menu

                            // Detect mouse position
                            var d = {}, x, y;
                            if( self.innerHeight ) {
                                d.pageYOffset = self.pageYOffset;
                                d.pageXOffset = self.pageXOffset;
                                d.innerHeight = self.innerHeight;
                                d.innerWidth = self.innerWidth;
                            } else if( document.documentElement &&
                                document.documentElement.clientHeight ) {
                                d.pageYOffset = document.documentElement.scrollTop;
                                d.pageXOffset = document.documentElement.scrollLeft;
                                d.innerHeight = document.documentElement.clientHeight;
                                d.innerWidth = document.documentElement.clientWidth;
                            } else if( document.body ) {
                                d.pageYOffset = document.body.scrollTop;
                                d.pageXOffset = document.body.scrollLeft;
                                d.innerHeight = document.body.clientHeight;
                                d.innerWidth = document.body.clientWidth;
                            }
                            (e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
                            (e.pageY) ? y = e.pageY : x = e.clientY + d.scrollTop;

                            // Show the menu
                            $(document).unbind('click');


                            menu.get(0).proccessHTML=function(){
                            var menu=$(this);
                            menu.find('a').mouseover( function() {
                                menu.find('LI.hover').removeClass('hover');
                                $(this).parent().addClass('hover');
                            }).mouseout( function() {
                                menu.find('LI.hover').removeClass('hover');
                            });

                            // Keyboard
                            $(document).keypress( function(e) {
                                switch( e.keyCode ) {
                                    case 38: // up
                                        if( menu.find('LI.hover').size() == 0 ) {
                                            menu.find('LI:last').addClass('hover');
                                        } else {
                                            menu.find('LI.hover').removeClass('hover').prevAll('LI').eq(0).addClass('hover');
                                            if( menu.find('LI.hover').size() == 0 ) menu.find('LI:last').addClass('hover');
                                        }
                                        break;
                                    case 40: // down
                                        if( menu.find('LI.hover').size() == 0 ) {
                                            menu.find('LI:first').addClass('hover');
                                        } else {
                                            menu.find('LI.hover').removeClass('hover').nextAll('LI').eq(0).addClass('hover');
                                            if( menu.find('LI.hover').size() == 0 ) menu.find('LI:first').addClass('hover');
                                        }
                                        break;
                                    case 13: // enter
                                        menu.find('LI.hover A').trigger('click');
                                        break;
                                    case 27: // esc
                                        $(document).trigger('click');
                                        break
                                }
                            });

                            // When items are selected
                            menu.find('A').unbind('click');
                            menu.find('LI A').click( function() {
                                $(document).unbind('click').unbind('keypress');
                                $(".contextMenu").hide("normal", o.afterHiding);
                                // Callback
                                if( callback ) callback( {value:$(this).attr('href').substr($(this).attr('href').indexOf("#")+1), label:$(this).html()}, $(srcElement), {
                                    x: x - offset.left,
                                    y: y - offset.top,
                                    docX: x,
                                    docY: y
                                } );
                                return false;
                            });

                            // Hide bindings
                            setTimeout( function() { // Delay for Mozilla
                                $(document).click( function() {
                                    $(document).unbind('click').unbind('keypress');
                                    menu.fadeOut(o.outSpeed, o.afterHiding);
                                    return false;
                                });
                            }, 0);
                        };
                        menu.css({
                            top: srcElement.parent().offset().top + srcElement.parent().outerHeight(),
                            left: srcElement.offset().left
                        }).fadeIn(o.inSpeed);
                        if(menu.get(0).menuShown){
                            menu.get(0).menuShown(srcElement);
                        }
                });

                // Disable text selection
                if( $.browser.mozilla ) {
                    menu.each( function() {
                        $(this).css({
                            'MozUserSelect' : 'none'
                        });
                    });
                } else if( $.browser.msie ) {
                    menu.each( function() {
                        $(this).bind('selectstart.disableTextSelect', function() {
                            return false;
                        });
                    });
                } else {
                    menu.each(function() {
                        $(this).bind('mousedown.disableTextSelect', function() {
                            return false;
                        });
                    });
                }
                // Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
                $(el).add('UL.contextMenu').bind('contextmenu', function() {
                    return false;
                });

            });
            return $(this);
        },



        // Destroy context menu(s)
        destroyContextMenu: function() {
            // Destroy specified context menus
            $(this).each( function() {
                // Disable action
                $(this).unbind('mousedown').unbind('mouseup');
            });
            return( $(this) );
        }

    });
})(jQuery);


// jQuery Context Menu Plugin Version 0.9
//
// Victor Hugo Herrera Maldonado
//
// Terms of Use
//
// This software is licensed under Apache License, Version 2.0 License and is copyrighted
// (C)2009 by Victor Hugo Herrera Maldonado
//
// For details, visit http://www.apache.org/licenses/LICENSE-2.0
//

/*
 * TODO:
 *       Fire event when context menu is hidden.
 */

(function($){
    var arrow="<span class='arrowButton' level='levelX'><a href='#pathArrow'>.</a></span>";

    $.fn.pathSelector = function(options, optionsFunc) {
        return this.each(function(index, element) {
            makePathSelector(element, options, false, optionsFunc);
        });
    };

    $.fn.pathSelectorAjax = function(options, url) {
        return this.each(function(index, element) {
            makePathSelector(element, options, true, url);
        });
    };

    $.fn.pathSelectorFixedOptions = function(optionsArray, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, false, function(value, subvalues){
                return optionsArray[subvalues.length];
            });
        });
    };

    $.fn.pathSelectorDynamicOptions = function(optionsFunc, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, false, optionsFunc);
        });
    };

    $.fn.pathSelectorAjaxOptions = function(url, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, true, url);
        });
    };


    function makePathSelector(input, options, isAjax, urlOrFunc) {
        if(input.name == "input"){
            return;
        }
        var defaults={
            separator: "."
        };
        options = $.extend({}, defaults, options);


        var jInput=$(input);
        jInput.css("display", "none");
        jInput.after("<span class='pathSelector'></span>");

        var jSpan=jInput.next("span");
        jInput.remove();
        jSpan.append(input);
        var pathSelector=jSpan.get(0);
        jSpan.append("<ul class='contextMenu'></ul>");
        pathSelector.options=options;
        pathSelector.fetchOptions=fetchOptions;
        pathSelector.getAndShowOptions=getAndShowOptions;
        pathSelector.setMenuOptions=setMenuOptions;
        pathSelector.appendLevelSelector=appendLevelSelector;
        pathSelector.showSelectedValue=showSelectedValue;
        pathSelector.getSelectedValues=getSelectedValues;
        pathSelector.cache=new Object();
        pathSelector.isAjax=isAjax;
        if(pathSelector.isAjax){
            pathSelector.url=urlOrFunc;
        }else{
            pathSelector.optionsFunc=urlOrFunc;
        }

        $(jInput).val("");
        valueChanged(input, "value", "");
    }

    function valueChanged(input, propName, value){
        /* Fire jQuery Event */
        $(input).trigger("valueChanged", value);
        /* Get options */
        $(input).parent().get(0).fetchOptions(value, function(options){
            if(options.length > 0){
                $(input).parent().get(0).appendLevelSelector();
            }
        });
    }

    function fetchOptions(value, callbackWhenFetched){
        var pathSelector=this;
        if(pathSelector.cache[value]){
            callbackWhenFetched(pathSelector.cache[value]);
        }else{
            if(pathSelector.isAjax){
                $.getJSON(pathSelector.url, {
                    value: value
                }, function(options){
                    pathSelector.cache[value]=options;
                    callbackWhenFetched(pathSelector.cache[value]);
                });
            }else{
                /* Transform the options if needed */
                var subvalues;
                if(value == ""){
                    subvalues=[];
                }else{
                    subvalues=value.split(pathSelector.options.separator);
                }
                var options=pathSelector.optionsFunc(value, subvalues);
                if(options == null){
                    options=[];
                }
                var tempOptions=[];
                $.each(options, function(index, option){
                    if(option.value){
                        tempOptions.push(option);
                    }else{
                        tempOptions.push({
                            value:option.toString()
                            });
                    }
                });
                pathSelector.cache[value]=tempOptions
                callbackWhenFetched(pathSelector.cache[value]);
            }
        }
    }

    function getAndShowOptions(value, appendMode){
        var pathSelector=this;
        pathSelector.fetchOptions(value, function(options){
            pathSelector.setMenuOptions(options);
        });
    }

    function showSelectedValue(option, level){
        /*window.alert("option: "+option.value);
        window.alert("level: "+level);*/
        var pathSelector=this;
        $(pathSelector).find(".level").each(
            function(index, el){
                if(index >= level){
                    //$(el).css("background-color", "red");
                    $(el).remove();
                }
            }
            );
        $(pathSelector).find(".arrowButton").each(
            function(index, el){
                if(index > level){
                    $(el).css("background-color", "red");
                    $(el).remove();
                }
            }
            );

        $(pathSelector).append("<span class='level' value='valueX' level='levelX'><a href='#pathLevel'>".replace("valueX", option.value).replace("levelX", level)+option.label+"</a></span>");
        $(pathSelector).find("span.level[level='"+level+"'] a").click(function(event){
            /*window.alert("selected:" + $(this).parent().attr("value"));
            window.alert("html:" + $(this).html());*/
            pathSelector.showSelectedValue({
                value:$(this).parent().attr("value"),
                label:$(this).html()
                }, $(this).parent().attr("level") );
        });
        var options=pathSelector.getSelectedValues();
        var valueString="";
        $.each(options, function(index, element){
            if(index > 0){
                valueString += pathSelector.options.separator;
            }
            valueString += element;
        });
        $(pathSelector).find("input").val(valueString);
        valueChanged($(pathSelector).find("input").get(0), "value", valueString);
    }

    function appendLevelSelector(){
        var pathSelector=this;
        var level=$(pathSelector).find(".arrowButton").length;
        $(pathSelector).append(arrow.replace("levelX", ""+level));
//        $(pathSelector).find(".arrowButton").find("a").html("&gt;");
        $(pathSelector).find(".arrowButton[level='"+level+"']").contextMenu(
        {
            menu: $(pathSelector).find(".contextMenu").get(0),
            afterHiding: function(){
                $(pathSelector).find("a").removeClass("pressed");
//                $(pathSelector).find(".arrowButton").find("a").html("&gt;");
            },
            menuShown:function(arrowElement){
                pathSelector.clickedArrow=arrowElement;
                $(arrowElement).find("a").addClass("pressed");
//                $(arrowElement).find("a").html("*");
                var value=$(pathSelector).find("input").val();
                var tokens=value.split(pathSelector.options.separator);

                var level=$(arrowElement).attr("level");
                var tempValue="";
                for(var i=0; i< level; i++){
                    if(i > 0){
                        tempValue+=pathSelector.options.separator;
                    }
                    tempValue+=tokens[i];
                }
                pathSelector.getAndShowOptions(tempValue);
            }
        },
        function(option, el, position){
            var level=$(el).attr("level");
            pathSelector.showSelectedValue(option, level);

        }
        );
        $(pathSelector).attr("levelCount", $(".arrowButton").length);
    }

    function getSelectedValues(){
        var values=[];
        $(this).find(".level").each(function(index, pathLevel){
            values.push($(pathLevel).attr("value"));
        });
        return values;
    }

    function setMenuOptions(options){
        var html="";
        $.each(options, function(index, option){
            html+="<li><a href='#"+option.value+"'>"+(option.label ? option.label : option.value)+"</a></li>\n";
        });
        $(this).find(".contextMenu").html(html);
        $(this).find(".contextMenu").get(0).proccessHTML();
    }

})(jQuery);