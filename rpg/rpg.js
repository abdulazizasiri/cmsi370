$(function() {

    window.onload = $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {
                var tableOfCharacters     = fillTableCharacterInfo('.character-template', character);
                var editModalForCharacter = $('.edit-character-modal-template').clone();
                var deleteModalForCharacter = $('.delete-character-modal-template').clone();

                tableOfCharacters.find(".btn-edit").bind("click", function() {
                    editCharacter(character.id, editModalForCharacter);
                });

                tableOfCharacters.find(".btn-remove").bind("click", function(){
                    deleteCharacter(character.id, deleteModalForCharacter);
                });

                return tableOfCharacters;
            }));
        }
    );

    $(".createCharacter").bind("click", function(){
        showCreateCharacterModal();
    })

    var showCreateCharacterModal = function(character) {
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_INFO,
            title: 'Create a New Character ',
            message: $(".new-character-template"),
            buttons: [
            {
                label: 'Change Character',
                cssClass: 'btn-warning',
                action: function(dialogueItself){
                    changeCharacter({
                        character: character,
                        nameInput: $(template).find("#name-change").val(),
                        classInput: $(template).find("#class-change").val(),
                        genderInput: $(template).find("#gender-change").val(),
                        levelInput: $(template).find("#level-change").val()
                    }, dialogueItself);
                }
            },
            {
                label: 'Cancel',
                cssClass: 'btn-danger',
                action: function(dialogueItself){
                    dialogueItself.close();
                }
            }]
        })
    };

    var deleteCharacter = function(character) {
        $('.remove-character-modal-template').find('.modal-message')
          .text('Are you sure you want to delete ' + character.name + '?');

        var deleteBtn = $(deleteModal).find('.btn-delete-character');
        $(deleteBtn).bind('click', function(){
            deleteCharacter(character, deleteModal);
            $(deleteBtn).button('loading');
            setTimeout(function (){
                $(deleteBtn).button('reset');
            }, 5000);
        })

        $(deleteModal).modal('show');

    }

    var sendDeleteRequest = function(character, deleteCharacterModal) {
        $.ajax({
            type: 'DELETE',
            url: "http://lmu-diabolical.appspot.com/characters/" + character.id,
            success: function (data, textStatus, jqXHR) {
                $(deleteCharacterModal).modal('hide');
                updateTableWithDelete(character);
                $('#successful-delete').show();
                $('html, body').animate({ scrollTop: 0 }, 0);
                setTimeout(function() {
                    $('#successful-delete').hide();
                }, 5000);
            }
        })
    }


    var deleteCharacter = function (characterId, deleteModal){
        var url = "http://lmu-diabolical.appspot.com/characters/" + characterId;
        $.getJSON(
            url,
            function (character) {
                $(deleteModal).find('.modal-message')
                  .html('Are you sure you want to delete ' + character.name + '?')
                $(deleteModal).modal('show');
                deleteBtn = $(deleteModal).find('.btn-delete-character');
                $(deleteBtn).bind("click", function(){
                    sendDeleteRequest(character, deleteModal);
                    $(deleteBtn).button('loading');
                    setTimeout(function (){
                        $(deleteBtn).button('reset');
                    }, 5000);
                });
            });
    }

    var editCharacter = function (characterId, editModal){
        var url = "http://lmu-diabolical.appspot.com/characters/" + characterId;
        $.getJSON(
            url,
            function (character) {
                fillModalCharacterInfo(editModal, character);
                $(editModal).modal('show');
                $(editModal).find('.btn-edit-character').bind("click", function(){
                    $(editModal).modal('hide');
                    var updatedCharacter = getUpdatedCharacter(character, editModal);
                    editCheck(character, updatedCharacter, editModal);
                });
            });
    }

    /* Get updated character given the user's input in the edit modal */
    var getUpdatedCharacter = function(originalCharacter, editModal){
        updatedCharacter = {
            id: originalCharacter.id,
            name: $(editModal).find("#name-change").val() || originalCharacter.name,
            classType: $(editModal).find("#class-change").val() || originalCharacter.classType,
            gender: $(editModal).find("#gender-change").val().toUpperCase() || originalCharacter.gender,
            level: $(editModal).find("#level-change").val() || originalCharacter.level
        }
        return updatedCharacter;
    }

    /* Double check that the user really wants to edit the character. */
    var editCheck = function(originalCharacter, updatedCharacter, editModalForCharacter) {
        var checkMessage = "Are you sure you want to edit " + originalCharacter.name + "?";
        $('#edit-check-modal').find('.modal-message').text(checkMessage);
        $('#edit-check-modal').modal('show');
        var editBtn = $('#edit-check-modal').find('.btn-edit');
        $(editBtn).bind("click", function(){
          sendUpdateRequest(updatedCharacter);
          resetModalInput(editModalForCharacter);
          $(editBtn).button('loading');
          setTimeout(function () {
            $(editBtn).button('reset');
          }, 5000);
        });
    }

    /* Reset the input forms to be empty again. */
    var resetModalInput = function(editModal){
        editModal.find('#name-change').val('');
        editModal.find('#class-change').val('');
        editModal.find('#gender-change').val('');
        editModal.find('#level-change').val('');
    }


    /* PUT request to diabolical server with character updates. */
    var sendUpdateRequest = function(updatedCharacter){
        $.ajax({
            type: 'PUT',
            url: "http://lmu-diabolical.appspot.com//characters/" + updatedCharacter.id,
            contentType: "application/json",
            dataType: "json",
            accept: "application/json",
            data: JSON.stringify(updatedCharacter),
            success: function (data, textStatus, jqXHR) {
                updateTableWithEdits(updatedCharacter);
                $('#edit-check-modal').modal('hide');
                $('html, body').animate({ scrollTop: 0 }, 0);
                $('#successful-edit').show();
                setTimeout(function() {
                    $('#successful-edit').hide();
                }, 5000);
            },
        });
    }

    /* Hide removed character from table without having to reload the page */
    var updateTableWithDelete = function(deletedCharacter){
        var rowToHide = '#' + deletedCharacter.id;
        $(rowToHide).hide();
    }

    /* Update table without having to reload the page. */
    var updateTableWithEdits = function (updatedCharacter){
        var characterId = '#' + updatedCharacter.id;
        $(characterId).find('.name').html(updatedCharacter.name);
        $(characterId).find('.class').html(updatedCharacter.classType);
        $(characterId).find('.gender').html(updatedCharacter.gender.toLowerCase());
        $(characterId).find('.level').html(updatedCharacter.level);
    }

    var fillGeneralCharacterInfo = function(template, character){
        $(template).attr("id", character.id);
        $(template).find(".name").text(character.name);
        $(template).find(".class").text(character.classType);
        $(template).find(".gender").text(character.gender.toLowerCase());
        $(template).find(".level").text(character.level);
    }

    var fillTableCharacterInfo = function(template, character) {
        var filledInTable = $(template).clone();
        fillGeneralCharacterInfo(filledInTable, character);
        return filledInTable;
    }

    var fillModalCharacterInfo = function(template, character){
        fillGeneralCharacterInfo(template, character);
        var title = '<h2>Edit ' + character.name + '</h2>';
        template.find('.modal-title').html(title);
        var imageSrc = '<img src=./' + character.gender.toLowerCase() + '.ico>';
        template.find('.image').html(imageSrc);
    }

});