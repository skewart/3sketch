
var CM;


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
			step: 1
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


// Deletes a parameter from the params list
function deleteParam( paramRow ) {
    var pName = $('.p_name', paramRow ).val();
    for ( var i = 0; i < P.params.length; i++ ) {
        if ( P.params[i].name === pName ) {
            P.params.splice( i, 1 );
        }
    }
    $(paramRow).remove();
    refreshFunctionText();
    refreshParamsInputs();
}


// Intercepts the code form submit and adds some data to it 
function submitRunForm() {
    $('#params_run_input').val( JSON.stringify( P.params ) );
    $('#code_run_input').val( btoa( CM.getValue() ) );
}


// Saves the current code and parameters, can be accessed by a unique URL
function saveDefinition() {
    var url = 'https://3sketch-c9-skewart.c9.io/new',
        designData = {
            geo_params: P.params,
            js_code: CM.getValue()
        };
    $.ajax( url, {
        type: 'POST',
        data: designData,
        dataType: 'json',
        success: function( data ) {
            var newUrl = window.location.origin + "/" + data.sketchId;
            $( '#save_url' ).attr('href', newUrl ).text( newUrl );
            $( '#saveModal' ).modal('show');
            window.history.pushState( designData, "", newUrl );
        },
        error: function( xhr, status, err ) {
            console.log( err );
        }
    });
}


function selectOption( optionId ) {

}


// As its name suggests, it hides the code panel
// Commented out until this is properly implemented.  Need to resolve the animated
// transition with how Bootsrap sets up the DOM and sizes things.
// function toggleCodePanel() {
//     var $cp = $('#code_panel'),
//         $da = $('#display_area'),
//         $mr = $('#main_row');
//     if ( $mr.attr('data-hidden') === 'true' ) {
//         $mr.css({ left: 'auto' });
//         $mr.attr('data-hidden', false);
//         $da.addClass('col-md-7');
//     } else {
//         $mr.css({left: -( $cp.width() ).toString() + 'px' });
//         $mr.attr('data-hidden', true);
//         $da.removeClass('col-md-7').css({width: '100%'});
//     }
// }


window.onload = function() {
	// Set up Code Mirror
	CM = CodeMirror( document.getElementById('codeGoesHere'), {
		value: atob( $('#functext').text() ),
		lineNumbers: true,
		autofocus: true,
		mode: "javascript"
	});
	// Event handlers
	$('#add_param').on('click', function(e) {
        e.preventDefault();
        addNewParam();
	});
	$( '#param_container' ).on('blur', 'input', function(e) {
        updateParamData();
	});
	$('#code_form').on('submit', function(e) {
        submitRunForm();
        //e.preventDefault();
	});
	$( '#param_container' ).on('click', 'button', function(e) {
        deleteParam(e.target.parentNode );
        e.preventDefault();
	})
	$( '#save_button' ).on( 'click', function(e) {
        saveDefinition();
        e.preventDefault();
	});
	$( '#hide_code_panel' ).on('click', function(e) {
	   toggleCodePanel(); 
	});
	
	refreshFunctionText();
	
	// Submit the form to create an initial scene for people to see
	$("#code_form").submit();

	window.onpopstate = function() {
        // Might cause page to double-load in some browsers
        window.location.href = document.location;
    }
}
