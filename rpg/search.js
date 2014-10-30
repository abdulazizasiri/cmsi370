$('#search').keyup(function() {
	var searchField = $('#search').val();
	var searchRegExp = new RegExp(searchField, "i");
    $(".character-template").each(function(index, row){
    	var allCells = $(row).find('td');
    	var nameCell = allCells[0];
    	($(nameCell).text().search(searchRegExp) !== -1) ? $(row).show() : $(row).hide();
    });
});