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
 *       Simplify distribution
 *
 */


(function($){
    var arrow="<span class='arrowButton' level='levelX'><a href='#pathArrow'>.</a></span>";

    var methods={
        val: function(parts) {
            if(parts){
                return this.each(function(index, element){
                    var pathSelector=$(this).parents(".pathSelector").get(0);
                    if(isString(parts)){
                        pathSelector.setParts(parts.split(pathSelector.options.separator));
                    }else{
                        pathSelector.setParts(parts);
                    }
                });
            }else{
                return this.each.val();
            }
        },
        init: function(optionsAccesor, pluginOptions) {
            return this.each(function(index, element){
                makePathSelector(element, pluginOptions, optionsAccesor)
            });
        }
    };

    $.fn.pathSelector = function(method) {
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
        }else{
            return methods.init.apply(this, arguments);
        }
    };
	
    /*$.fn.pathSelectorAjax = function(options, url) {
        return this.each(function(index, element) {
            makePathSelector(element, options, true, url);
        });
    };*/
	
    /*$.fn.pathSelectorFixedOptions = function(optionsArray, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, function(value, subvalues){
                return optionsArray[subvalues.length];
            });
        });
    };
	
    $.fn.pathSelectorDynamicOptions = function(optionsFunc, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, optionsFunc);
        });
    };*/
	
    /*$.fn.pathSelectorAjaxOptions = function(url, options) {
        return this.each(function(index, element) {
            makePathSelector(element, options, url);
        });
    };*/

    /*$.fn.pathSelectorValues = function(values) {
        if(values){
            return this.each(function(index, element) {
                var pathSelector=$(this).parents(".pathSelector").get(0);
                pathSelector.setValues(values);
            });
        }else{
            return this.get(0).getValues();
        }
    };*/
	

    function makePathSelector(input, pluginOptions, optionsAccesor) {
        if(input.name == "input"){
            return;
        }
        var defaults={
            separator: "."
        };
        pluginOptions = $.extend({}, defaults, pluginOptions);


        /* Apply the html changes to wrap the input element, insert the selector and the options menu */
        
        $(input).wrap("<span class='pathSelector'></span>")
                .hide();

        var pathSelector=$(input).parents(".pathSelector").get(0);
        $(pathSelector).append("<ul class='contextMenu'></ul>");

        /* Define the internal functions of the plugin. */
        

        /* Model functions */
        pathSelector.setParts=function(parts){
            $(this).find(".arrowButton").remove();
            $(this).find(".level").remove();
            var valueString="";
            for(var i=0; i < parts.length; i++){
                var wrappedValue=wrapValue(parts[i]);
                this.addOptionsExpander();
                this.addValuePart(wrappedValue);
                if(i > 0){
                    valueString += pathSelector.options.separator;
                }
                valueString += wrappedValue.value;
            }
            pathSelector.values=parts;
            $(this).find("input").val(valueString);
            pathSelector.fetchOptions(valueString, function(menuOptions){
                if(menuOptions.length > 0){
                   pathSelector.addOptionsExpander();
                }
            });
        };

        pathSelector.getValues=function(){
            
        }

        pathSelector.addValue=function(value){
            var wrappedValue=wrapValue(value);
            this.addValuePart(wrappedValue);
            pathSelector.values.push(value);
            var valueString=$(this).find("input").val();
            if(valueString.length > 0){
                valueString += pathSelector.options.separator;
            }
            valueString += wrappedValue.value;
            $(this).find("input").val(valueString);
            pathSelector.fetchOptions(valueString, function(menuOptions){
                if(menuOptions.length > 0){
                   pathSelector.addOptionsExpander();
                }
            });
        };
        
        pathSelector.getValue=function(level){
            var valueString="";
            $(this).find("span.level").each(function(index, element){
                if(index < level){
                    if(index > 0){
                        valueString += pathSelector.options.separator;
                    }
                    valueString += $(element).attr("value");
                    return true;
                }else{
                    return false;
                }
            });
            return valueString;
        }

        pathSelector.removeLastLevels=function(levelCount){
            var pathSelector=this;
            var level=$(pathSelector).find(".level").length-levelCount;
            $(pathSelector).find(".level").each(function(index, el){
                if(index >= level){
                    $(el).remove();
                }
            });
            $(pathSelector).find(".arrowButton").each(function(index, el){
                if(index > level){
                    $(el).remove();
                }
            });
            var valueString="";
            $(pathSelector).find("span.level").each(function(index, element){
                if(index > 0){
                    valueString += pathSelector.options.separator;
                }
                valueString += $(element).attr("value");
            });
            $(pathSelector).find("input").val(valueString);
        }

        /* UI */

        pathSelector.addValuePart=function(o){
            var level=$(pathSelector).find("span.level").length;
            $("<span class='level'><a href='#pathLevel'></a></span>")
                .appendTo(this)
                .attr("value", o.value)
                .attr("level", level)
                .find("a").html(o.label);
        };
        
        pathSelector.addOptionsExpander=function(){
            var level=$(this).find(".arrowButton").length;
            var button=$(arrow.replace("levelX", ""+level));
            $(this).append(button);
            configureButton(this, button.get(0));
        };

        pathSelector.fetchOptions=function(value, callbackWhenFetched){
            var pathSelector=this;
            var menuOptions=null;
            if(pathSelector.cache[value]){
                menuOptions=pathSelector.cache[value];
                callbackWhenFetched(menuOptions);
            }else{
                if(isString(pathSelector.optionsAccesor)){
                    $.getJSON(pathSelector.optionsAccesor, {
                            value: value
                        }, function(options){
                            menuOptions=options;
                            pathSelector.cache[value]=menuOptions;
                            callbackWhenFetched(menuOptions);
                    });
                }else if(isFunction(pathSelector.optionsAccesor)){
                    /* Transform the options if needed */
                    var subvalues;
                    if(value == ""){
                        subvalues=[];
                    }else{
                        subvalues=value.split(pathSelector.options.separator);
                    }
                    var options=pathSelector.optionsAccesor(value, subvalues);
                    menuOptions=options != null ? options: [];
                    pathSelector.cache[value]=menuOptions;
                    callbackWhenFetched(menuOptions);
                }
            }
        };

        pathSelector.showOptionsMenu=function(menuOptions){
            var html="";
            $.each(menuOptions, function(index, option){
                var wrappedValue=wrapValue(option);
                html+="<li><a href='#"+wrappedValue.value+"'>"+wrappedValue.label+"</a></li>\n";
            });
            $(this).find(".contextMenu").html(html);
            $(this).find(".contextMenu").get(0).proccessHTML();
        };

        $(pathSelector).find("span.level").live("click", function(){
            pathSelector.removeLastLevels(($(pathSelector).find("span.level").length -1) - $(this).attr("level"));
        });

        pathSelector.options=pluginOptions;
        pathSelector.cache=new Object();
        if(isFunction(optionsAccesor) || isString(optionsAccesor)){
            pathSelector.optionsAccesor=optionsAccesor;
        }else{
            pathSelector.optionsAccesor=function(value, subvalues){
                return optionsAccesor[subvalues.length];
            };
        }

        /* Set the init value (empty value) */
        pathSelector.values=[];
        if(pathSelector.options.initValue){
            pathSelector.setParts(pathSelector.options.initValue);
        }else{
            pathSelector.setParts([]);
        }
    }

    function isFunction(o){
        return typeof o == "function";
    }

//    function isArray(o){
//        return typeof o == "Array";
//    }

    function isString(o){
        return typeof o == "string";
    }

    function wrapValue(o){
        if(o.value){
            return o.label ? o : {value: o.value, label: o.value};
        }else{
            return {value: o, label: o.toString()};
        }
    }

    function configureButton(pathSelector, expanderButton){
        $(expanderButton).contextMenu(
        {
            menu: $(pathSelector).find(".contextMenu").get(0),
            afterHiding: function(){
                $(pathSelector).find("a").removeClass("pressed");
            },
            menuShown:function(arrowElement){
                var menuOptions=pathSelector.cache[pathSelector.getValue(arrowElement.attr("level"))];
                if(! menuOptions){
                    pathSelector.fetchOptions(pathSelector.getValue(arrowElement.attr("level")), function(mOptions){
                        pathSelector.showOptionsMenu(mOptions);
                    });
                }else{
                    pathSelector.showOptionsMenu(menuOptions);
                }
            }
        },
        function(option, el, position){
            var level=$(el).attr("level");
            pathSelector.removeLastLevels($(pathSelector).find("span.level").length-level);
            pathSelector.addValue(option);
        }
        );
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

})(jQuery);