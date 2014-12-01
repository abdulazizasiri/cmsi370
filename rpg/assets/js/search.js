$(function(){
    $('#search').keyup(function() { // JD: 9
        var searchField = $('#search').val();
        var searchRegExp = new RegExp(searchField, "i");
        $(".character-template").each(function(index, row){ // JD: 10
            var allCells = $(row).find('td');
            var nameCell = allCells[0];
            ($(nameCell).text().search(searchRegExp) !== -1) ? $(row).show() : $(row).hide(); // JD: 11

            /* JD: ...The above is rightly an if statement due to the side effect:
            
            if ($(nameCell).text().search(searchRegExp) !== -1) {
                $(row).show();
            } else {
                $(row).hide();
            }
            
            ......Now, if you *really* want to use a conditional, check this out---though
               one can argue that it is less readable:
              
            $(row)[($(nameCell).text().search(searchRegExp) !== -1) ? 'show' : 'hide']();

               (I'd say this is a case where the semantics is right, but the resulting code
                is a tad more obscure...discuss :) )
            */
        });
    });
});
