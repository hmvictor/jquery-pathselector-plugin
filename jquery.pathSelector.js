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
            
            myWatch(input, "value", valueChanged);
            $(jInput).val("");
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
                $.getJSON(pathSelector.url, {value: value}, function(options){
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
                                tempOptions.push({value:option.toString()});
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
            pathSelector.showSelectedValue({value:$(this).parent().attr("value"), label:$(this).html()}, $(this).parent().attr("level") );
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
    }

    function appendLevelSelector(){
        var pathSelector=this;
        var level=$(pathSelector).find(".arrowButton").length;
        $(pathSelector).append(arrow.replace("levelX", ""+level));
        $(pathSelector).find(".arrowButton[level='"+level+"']").contextMenu(
            {
                menu: $(pathSelector).find(".contextMenu").get(0),
                afterHiding: function(){
                    //$(pathSelector).find("img").attr("src", imageDir+"/arrowrgt.gif");
                    $(pathSelector).find("a").removeClass("pressed");					
                },
                menuShown:function(arrowElement){
                    pathSelector.clickedArrow=arrowElement;
                    //$(arrowElement).find("img").attr("src", imageDir+"/arrowdwn.gif");
                    $(arrowElement).find("a").addClass("pressed");
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

    function myWatch(object, propertyName, myFunction){
        if(object.watch){
            object.watch(propertyName, function(propName, oldVal, newVal){
                myFunction(object, propName, newVal);
                return newVal;
            });
        }else{
            object.onpropertychange=function(){
                if(event.propertyName == propertyName){
                    myFunction(event.srcElement, event.propertyName, event.srcElement[event.propertyName]);
                }
            };
        }
    }

})(jQuery);