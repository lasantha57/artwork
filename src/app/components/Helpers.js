import { fabric } from 'fabric';
import $ from 'jquery';

//Function to remove duplicate items from the array.
export function unique(dupArray) {
    return dupArray.reduce(function (previous, num) {
        if (previous.find(function (item) {
            return item === num;
        })) {
            return previous;
        }
        else {
            previous.push(num);
            return previous;
        }
    }, []);
}

//Function to get offset left and top of the DOM element.
export function getOffset(el) {
    el = document.getElementById(el);
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

//Function to save canvas history for undo / redo.
export function saveCanvasState(canvas) {
    if (canvas.stateaction && canvas.state) {
        var newstate = [];
        var index = canvas.index;
        var state = canvas.state;
        for (var i = 0; i <= index; i++) {
            newstate.push(state[i]);
        }
        state = newstate;
        var myjson = JSON.stringify(canvas);
        state[++index] = myjson;
        if (state.length >= 80) state = state.splice(-5, 5);
        canvas.state = state;
        canvas.index = index;
    }
}

/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */
export function initCenteringGuidelines(canvas) {
    var canvasWidth = canvas.getWidth(),
        canvasHeight = canvas.getHeight(),
        canvasWidthCenter = canvasWidth / 2,
        canvasHeightCenter = canvasHeight / 2,
        canvasWidthCenterMap = {},
        canvasHeightCenterMap = {},
        centerLineMargin = 4,
        centerLineColor = 'rgba(255,0,241,0.5)',
        centerLineWidth = 1,
        ctx = canvas.getSelectionContext(),
        viewportTransform;

    for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
        canvasWidthCenterMap[Math.round(i)] = true;
    }
    for (var j = canvasHeightCenter - centerLineMargin, lens = canvasHeightCenter + centerLineMargin; j <= lens; j++) {
        canvasHeightCenterMap[Math.round(j)] = true;
    }

    function showVerticalCenterLine() {
        showCenterLine(canvasWidthCenter + 0.5, 0, canvasWidthCenter + 0.5, canvasHeight);
    }

    function showHorizontalCenterLine() {
        showCenterLine(0, canvasHeightCenter + 0.5, canvasWidth, canvasHeightCenter + 0.5);
    }

    function showCenterLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = centerLineColor;
        ctx.lineWidth = centerLineWidth;
        ctx.beginPath();
        ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
        ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
        ctx.stroke();
        ctx.restore();
    }
    //var afterRenderActions = [],
    var isInVerticalCenter,
        isInHorizontalCenter;
    canvas.on('mouse:down', function () {
        viewportTransform = canvas.viewportTransform;
    });
    canvas.on('object:moving', function (e) {
        var object = e.target,
            objectCenter = object.getCenterPoint(),
            transform = canvas._currentTransform;
        if (!transform) return;
        isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap;
        isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;
        if (isInHorizontalCenter || isInVerticalCenter) {
            object.setPositionByOrigin(new fabric.Point((isInVerticalCenter ? canvasWidthCenter : objectCenter.x), (isInHorizontalCenter ? canvasHeightCenter : objectCenter.y)), 'center', 'center');
        }
    });
    canvas.on('before:render', function () {
        canvas.clearContext(canvas.contextTop);
    });
    canvas.on('after:render', function () {
        if (isInVerticalCenter) {
            showVerticalCenterLine();
        }
        if (isInHorizontalCenter) {
            showHorizontalCenterLine();
        }
    });
    canvas.on('mouse:up', function () {
        // clear these values, to stop drawing guidelines once mouse is up
        isInVerticalCenter = isInHorizontalCenter = null;
        canvas.renderAll();
    });
}
/**
 * Should objects be aligned by a bounding box?
 * [Bug] Scaled objects sometimes can not be aligned by edges
 *
 */
export function initAligningGuidelines(canvas) {
    var ctx = canvas.getSelectionContext(),
        aligningLineOffset = 5,
        aligningLineMargin = 4,
        aligningLineWidth = 1,
        aligningLineColor = 'rgb(0,255,0)',
        viewportTransform,
        zoom = 1;

    function drawVerticalLine(coords) {
        drawLine(coords.x + 0.5, coords.y1 > coords.y2 ? coords.y2 : coords.y1, coords.x + 0.5, coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    function drawHorizontalLine(coords) {
        drawLine(coords.x1 > coords.x2 ? coords.x2 : coords.x1, coords.y + 0.5, coords.x2 > coords.x1 ? coords.x2 : coords.x1, coords.y + 0.5);
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = aligningLineColor;
        ctx.beginPath();
        ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
        ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
        ctx.stroke();
        ctx.restore();
    }

    function isInRange(value1, value2) {
        value1 = Math.round(value1);
        value2 = Math.round(value2);
        for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
            if (i === value2) {
                return true;
            }
        }
        return false;
    }
    var verticalLines = [],
        horizontalLines = [];
    canvas.on('mouse:down', function () {
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    });
    canvas.on('object:moving', function (e) {
        var activeObject = e.target,
            canvasObjects = canvas.getObjects(),
            activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectLeft = activeObjectCenter.x,
            activeObjectTop = activeObjectCenter.y,
            activeObjectBoundingRect = activeObject.getBoundingRect(),
            activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
            activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
            horizontalInTheRange = false,
            verticalInTheRange = false,
            transform = canvas._currentTransform;
        if (!transform) return;
        // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
        // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move
        for (var i = canvasObjects.length; i--;) {
            if (canvasObjects[i] === activeObject) continue;
            var objectCenter = canvasObjects[i].getCenterPoint(),
                objectLeft = objectCenter.x,
                objectTop = objectCenter.y,
                objectBoundingRect = canvasObjects[i].getBoundingRect(),
                objectHeight = objectBoundingRect.height / viewportTransform[3],
                objectWidth = objectBoundingRect.width / viewportTransform[0];
            // snap by the horizontal center line
            if (isInRange(objectLeft, activeObjectLeft)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
            }
            // snap by the left edge
            if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft - objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
            }
            // snap by the right edge
            if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft + objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
            }
            // snap by the vertical center line
            if (isInRange(objectTop, activeObjectTop)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
            }
            // snap by the top edge
            if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop - objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
            }
            // snap by the bottom edge
            if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop + objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
            }
        }
        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }
        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });
    canvas.on('before:render', function () {
        canvas.clearContext(canvas.contextTop);
    });
    canvas.on('after:render', function () {
        for (var i = verticalLines.length; i--;) {
            drawVerticalLine(verticalLines[i]);
        }
        for (var j = horizontalLines.length; j--;) {
            drawHorizontalLine(horizontalLines[j]);
        }
        verticalLines.length = horizontalLines.length = 0;
    });
    canvas.on('mouse:up', function () {
        verticalLines.length = horizontalLines.length = 0;
        canvas.renderAll();
    });
}

export function selectObject(canvas, activeObject) {
    $(".iconbar").show();
    if (canvas) {
        if (!activeObject)
            activeObject = canvas.getActiveObject();

        if (!activeObject) {
            $(".iconbar").hide();
            return false;
        }

        canvas.selectedObject = activeObject;

        $(".group").css('display', 'none');
        $(".ungroup").css('display', 'none');
        if (activeObject.type === 'activeSelection') {
            $(".group").css('display', 'block');
        }


        if (activeObject.type === 'text') {
            $(".fontsize").show();
            $(".fontFamily").show();
            $(".colorpic").show();
            $(".txtbold").show();
            $(".txtitalic").show();
            $(".txtunder").show();
            $(".txtleft").show();
            $(".txtcenter").show();
            $(".txtright").show();
            $(".txteff").show();
            $(".strokeeff").hide();
            $(".elementeff").css('display', 'none');
            $(".outlinecolpick").css("background", activeObject.stroke);
        }
        if (activeObject.type === 'path') {
            $(".fontsize").hide();
            $(".fontFamily").hide();
            $(".colorpic").show();
            $(".txtbold").hide();
            $(".txtitalic").hide();
            $(".txtunder").hide();
            $(".txtleft").hide();
            $(".txtcenter").hide();
            $(".txtright").hide();
            $(".txteff").hide();
            $(".strokeeff").show();
            $(".elementeff").css('display', 'block');
            $(".colorpic").css('margin-left', '10px');
            $(".textcolpick").css("background", activeObject.fill);
            $(".strokecolpick").css("background", activeObject.stroke);
        }
        if (activeObject.type === 'group') {
            $(".fontsize").hide();
            $(".fontFamily").hide();
            $(".colorpic").show();
            $(".txtbold").hide();
            $(".txtitalic").hide();
            $(".txtunder").hide();
            $(".txtleft").hide();
            $(".txtcenter").hide();
            $(".txtright").hide();
            $(".txteff").hide();
            $(".strokeeff").show();
            $(".elementeff").css('display', 'block');
            $(".colorpic").css('margin-left', '10px');
            $(".group").css('display', 'none');
            $(".ungroup").css('display', 'block');
            $(".textcolpick").css("background", activeObject.fill);
            $(".strokecolpick").css("background", activeObject.stroke);

            activeObject.subTargetCheck = true;
        }

        if (activeObject.type === 'image') {
            $(".fontsize").hide();
            $(".fontFamily").hide();
            $(".colorpic").hide();
            $(".txtbold").hide();
            $(".txtitalic").hide();
            $(".txtunder").hide();
            $(".txtleft").hide();
            $(".txtcenter").hide();
            $(".txtright").hide();
            $(".txteff").hide();
            $(".elementeff").css('display', 'block');
            $(".sendback").css('margin-left', '10px');
            $(".strokeeff").hide();
        }
        canvas.renderAll();

    }
}
