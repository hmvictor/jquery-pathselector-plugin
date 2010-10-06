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

    $.fn.setValues = function(values) {
        return this.each(function(index, element) {
            var pathSelector=$(this).parents(".pathSelector").get(0);
            pathSelector.setValues(values);
        });
    };
	

    function makePathSelector(input, pluginOptions, isAjax, urlOrFunc) {
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
        pathSelector.setValues=function(values){
            $(this).find(".arrowButton").remove();
            $(this).find(".level").remove();
            var valueString="";
            for(var i=0; i < values.length; i++){
                var wrappedValue=wrapValue(values[i]);
                this.addOptionsExpander();
                this.addValuePart(wrappedValue);
                if(i > 0){
                    valueString += pathSelector.options.separator;
                }
                valueString += wrappedValue.value;
            }
            pathSelector.values=values;
            $(this).find("input").val(valueString);
            pathSelector.fetchOptions(valueString, function(menuOptions){
                if(menuOptions.length > 0){
                   pathSelector.addOptionsExpander();
                }
            });
        };

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
                if(pathSelector.isAjax){
                    $.getJSON(pathSelector.url, {
                            value: value
                        }, function(options){
                            menuOptions=options;
                            pathSelector.cache[value]=menuOptions;
                            callbackWhenFetched(menuOptions);
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
//        pathSelector.fetchOptions2=fetchOptions2;
//        pathSelector.getAndShowOptions=getAndShowOptions;
//        pathSelector.setMenuOptions=setMenuOptions;
//        pathSelector.appendLevelSelector=appendLevelSelector;
//        pathSelector.showSelectedValue=showSelectedValue;
//        pathSelector.getSelectedValues=getSelectedValues;
        pathSelector.cache=new Object();
        pathSelector.isAjax=isAjax;
        if(pathSelector.isAjax){
            pathSelector.url=urlOrFunc;
        }else{
            pathSelector.optionsFunc=urlOrFunc;
        }

        /* Set the init value (empty value) */
        pathSelector.values=[];
        if(pathSelector.options.initValue){
            pathSelector.setValues(pathSelector.options.initValue);
        }else{
            pathSelector.setValues([]);
        }
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

//    function fetchOptions2(value, callbackWhenFetched){
//        var pathSelector=this;
//        if(pathSelector.cache[value]){
//            callbackWhenFetched(pathSelector.cache[value]);
//        }else{
//            if(pathSelector.isAjax){
//                $.getJSON(pathSelector.url, {
//                    value: value
//                }, function(options){
//                    pathSelector.cache[value]=options;
//                    callbackWhenFetched(pathSelector.cache[value]);
//                });
//            }else{
//                /* Transform the options if needed */
//                var subvalues;
//                if(value == ""){
//                    subvalues=[];
//                }else{
//                    subvalues=value.split(pathSelector.options.separator);
//                }
//                var options=pathSelector.optionsFunc(value, subvalues);
//                if(options == null){
//                    options=[];
//                }
//                var tempOptions=[];
//                $.each(options, function(index, option){
//                    if(option.value){
//                        tempOptions.push(option);
//                    }else{
//                        tempOptions.push({
//                            value:option.toString()
//                            });
//                    }
//                });
//                pathSelector.cache[value]=tempOptions
//                callbackWhenFetched(pathSelector.cache[value]);
//            }
//        }
//    }
//
//    function getAndShowOptions(value, appendMode){
//        var pathSelector=this;
//        pathSelector.fetchOptions(value, function(options){
//            pathSelector.setMenuOptions(options);
//        });
//    }
//
//    function showSelectedValue(option, level){
//        /*window.alert("option: "+option.value);
//        window.alert("level: "+level);*/
//        var pathSelector=this;
//        $(pathSelector).find(".level").each(
//            function(index, el){
//                if(index >= level){
//                    //$(el).css("background-color", "red");
//                    $(el).remove();
//                }
//            }
//            );
//        $(pathSelector).find(".arrowButton").each(
//            function(index, el){
//                if(index > level){
//                    $(el).css("background-color", "red");
//                    $(el).remove();
//                }
//            }
//            );
//
//        $(pathSelector).append("<span class='level' value='valueX' level='levelX'><a href='#pathLevel'>".replace("valueX", option.value).replace("levelX", level)+option.label+"</a></span>");
//        $(pathSelector).find("span.level[level='"+level+"'] a").click(function(event){
//            /*window.alert("selected:" + $(this).parent().attr("value"));
//            window.alert("html:" + $(this).html());*/
//            pathSelector.showSelectedValue({
//                value:$(this).parent().attr("value"),
//                label:$(this).html()
//                }, $(this).parent().attr("level") );
//        });
//        var options=pathSelector.getSelectedValues();
//        var valueString="";
//        $.each(options, function(index, element){
//            if(index > 0){
//                valueString += pathSelector.options.separator;
//            }
//            valueString += element;
//        });
//        $(pathSelector).find("input").val(valueString);
//        valueChanged($(pathSelector).find("input").get(0), "value", valueString);
//    }
//
//    function appendLevelSelector(){
//        var pathSelector=this;
//        var level=$(pathSelector).find(".arrowButton").length;
//        $(pathSelector).append(arrow.replace("levelX", ""+level));
////        $(pathSelector).find(".arrowButton").find("a").html("&gt;");
//        $(pathSelector).find(".arrowButton[level='"+level+"']").contextMenu(
//        {
//            menu: $(pathSelector).find(".contextMenu").get(0),
//            afterHiding: function(){
//                $(pathSelector).find("a").removeClass("pressed");
////                $(pathSelector).find(".arrowButton").find("a").html("&gt;");
//            },
//            menuShown:function(arrowElement){
//                pathSelector.clickedArrow=arrowElement;
//                $(arrowElement).find("a").addClass("pressed");
////                $(arrowElement).find("a").html("*");
//                var value=$(pathSelector).find("input").val();
//                var tokens=value.split(pathSelector.options.separator);
//
//                var level=$(arrowElement).attr("level");
//                var tempValue="";
//                for(var i=0; i< level; i++){
//                    if(i > 0){
//                        tempValue+=pathSelector.options.separator;
//                    }
//                    tempValue+=tokens[i];
//                }
//                pathSelector.getAndShowOptions(tempValue);
//            }
//        },
//        function(option, el, position){
//            var level=$(el).attr("level");
//            pathSelector.showSelectedValue(option, level);
//
//        }
//        );
//        $(pathSelector).attr("levelCount", $(".arrowButton").length);
//    }
//
//    function getSelectedValues(){
//        var values=[];
//        $(this).find(".level").each(function(index, pathLevel){
//            values.push($(pathLevel).attr("value"));
//        });
//        return values;
//    }
//
//    function setMenuOptions(options){
//        var html="";
//        $.each(options, function(index, option){
//            html+="<li><a href='#"+option.value+"'>"+(option.label ? option.label : option.value)+"</a></li>\n";
//        });
//        $(this).find(".contextMenu").html(html);
//        $(this).find(".contextMenu").get(0).proccessHTML();
//    }

})(jQuery);