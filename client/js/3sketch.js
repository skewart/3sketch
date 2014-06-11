
var P = {
        params: [
            { name: "width", min: 1, max: 20, inc: 1, value: 10 },
            { name: "height", min: 1, max: 20, inc: 1, value: 10 }
        ]
    }

// Updates the params inputs UI to be in sync with the params list (typically P.params)
function refreshParamsInputs( paramsList ) {
    paramsList = paramsList || P.params;
    $('.param_field').empty();
    $('.param').each( function( idx, inpt ) {
        for ( var p in paramsList[idx] ) {
            $('.p_' + p, inpt ).attr('value', paramsList[ idx ][ p ] );
        }
    })
}


// Updates the list of functions (and any other closely related UI)
function refreshFunctionText( paramsList ) {
    paramsList = paramsList || P.params;
    var pnames = [];
    for ( var i = 0; i < paramsList.length; i++ ) {
        pnames.push( paramsList[i].name );
    }
    $('#args').empty().text( pnames.join(', ') + ' ' );
}

// Updates the params list with new data from the form inputs
function updateParamData( paramsList ) {
    paramsList = paramsList || P.params;
    var type;
    $('.param').each( function( idx, row ) {
        $('.param_field', row ).each( function( jdx, inpt ) {
            type = $(inpt).attr('id').split('_')[1];
            paramsList[ idx ][ type ] = $(inpt).val();
        });
    });
    refreshFunctionText();
}

// Primary handler for when a user wants to add a new paramter
function addNewParam() {
	var p = {
			name: "none",
			min: 1,
			max: 10,
			value: 5,
			inc: 1
		};
	P.params.push( p );
	
	var np = $(".param").first().clone();
	$('input', np ).each( function( idx, inpt ) {
        $(inpt).attr('value', '');
	});
	$('#param_container').append( np );
	
	refreshFunctionText();
	refreshParamsInputs();
}


window.onload = function() {
	// Set up Code Mirror
	CM = CodeMirror( document.getElementById('codeGoesHere'), {
		value: "return new THREE.CubeGeometry( width, depth, height )\n",
		lineNumbers: true,
		autofocus: true
	});
	// Event handlers
	$('#add_param').on('click', function(e) {
	    e.preventDefault();
	    addNewParam();
	});
	$( '#param_container' ).on('blur', 'input', function(e) {
	    updateParamData();
	});
}