$(function() {

    window.onload = $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            console.log("initial GET " + JSON.stringify(characters));
            $("tbody").append(characters.map(function (character) {
                var tableOfCharacters     = fillTable('.character-template', character);
                var editModalForCharacter = $('.edit-character-modal-template').clone()

                tableOfCharacters.find(".edit").bind("click", function() {
                    editModalForCharacter = fillEditModal(editModalForCharacter, character);
                    edit(character, editModalForCharacter);
                });

                tableOfCharacters.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
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

    var showDeleteCharacterModal = function(character) {
        var deleteModal = $('.delete-modal-template');
        $(deleteModal).find('.modal-message')
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

    var deleteCharacter = function(character, deleteCharacterModal) {
        $.ajax({
            type: 'DELETE',
            url: "http://lmu-diabolical.appspot.com/characters/" + character.id,
            success: function (data, textStatus, jqXHR) {
                $(deleteCharacterModal).modal('hide');
                updateTableWithDelete(character);
                $('#successful-delete').show()
                setTimeout(function() {
                    $('#successful-delete').hide();
                }, 5000);
            }
        })
    }

    var edit = function(character, editModalForCharacter) {
        $(editModalForCharacter).find('.btn-edit-character').bind("click", function(){
            $(editModalForCharacter).modal('hide');
            var updatedCharacter = {
                id: character.id,
                name: $(editModalForCharacter).find("#name-change").val() || character.name,
                classType: $(editModalForCharacter).find("#class-change").val() || character.classType,
                gender: $(editModalForCharacter).find("#gender-change").val().toUpperCase() || character.gender,
                level: $(editModalForCharacter).find("#level-change").val() || character.level
            }
            editCheck(character, updatedCharacter, editModalForCharacter);
        });

        $(editModalForCharacter).modal('show');
    }

    var editCheck = function(originalCharacter, updatedCharacter, editModalForCharacter) {
        var checkMessage = "Are you sure you want to edit " + originalCharacter.name + "?";
        $('.edit-check-modal').find('.modal-message').text(checkMessage);
        $('.edit-check-modal').modal('show');
        var editBtn = $('.edit-check-modal').find('.btn-edit');
        $(editBtn).bind("click", function(){
          resetModal(editModalForCharacter);
          getCharacter(originalCharacter, updatedCharacter);
          $(editBtn).button('loading');
          setTimeout(function () {
            $(editBtn).button('reset');
          }, 5000);
        });
    }

    var resetModal = function(editModalForCharacter){
        console.log(editModalForCharacter);
        console.log((editModalForCharacter).find('#name-change').val(''));
    }


    var sendCharacterUpdates = function(originalCharacter, updatedCharacter){
        $.ajax({
            type: 'PUT',
            url: "http://lmu-diabolical.appspot.com//characters/" + originalCharacter.id,
            contentType: "application/json",
            dataType: "json",
            accept: "application/json",
            data: JSON.stringify(updatedCharacter),
            success: function (data, textStatus, jqXHR) {
                console.log('data' + data);
                console.log('textStatus: ' + textStatus);
                console.log('jqXHR ' + JSON.stringify(jqXHR));
                updateOriginalCharacter(originalCharacter, updatedCharacter);
                $('.edit-check-modal').modal('hide');
                $('#successful-edit').show();
                setTimeout(function() {
                    $('#successful-edit').hide();
                }, 5000);
            },
        });
    }

    var getCharacter = function(originalCharacter, updatedCharacter){
        var url = "http://lmu-diabolical.appspot.com/characters/" + originalCharacter.id;
        $.getJSON(
            url,
            function (character) {
                sendCharacterUpdates(character, updatedCharacter);
            // Do something with the character.
            });
    }


    var updateOriginalCharacter = function(originalCharacter, updatedCharacter){
        originalCharacter.name = updatedCharacter.name;
        originalCharacter.gender = updatedCharacter.gender.toLowerCase();
        originalCharacter.classType = updatedCharacter.classType;
        originalCharacter.level = updatedCharacter.level;
        updateTableWithEdits(originalCharacter);
    }


    var updateTableWithDelete = function(deletedCharacter){
        var rowToHide = '#' + deletedCharacter.id;
        $(rowToHide).hide();
    }

    var updateTableWithEdits = function (updatedCharacter){
        var characterId = '#' + updatedCharacter.id;
        $(characterId).find('.name').html(updatedCharacter.name);
        $(characterId).find('.class').html(updatedCharacter.class);
        $(characterId).find('.gender').html(updatedCharacter.gender);
        $(characterId).find('.level').html(updatedCharacter.level);
    }

    var fillCharacterInfo = function(template, character){
        $(template).attr("id", character.id);
        $(template).find(".name").text(character.name);
        $(template).find(".class").text(character.classType);
        $(template).find(".gender").text(character.gender.toLowerCase());
        $(template).find(".level").text(character.level);
    }

    var fillTable = function(template, character) {
        var filledInTable = $(template).clone();
        fillCharacterInfo(filledInTable, character);
        return filledInTable;
    }

    var fillEditModal = function(template, character){
        var filledInEditModal = $(template);
        fillCharacterInfo(filledInEditModal, character);
        var title = '<h2>Edit ' + character.name + '</h2>';
        filledInEditModal.find('.modal-title').html(title);
        var imageSrc = '<img src=./' + character.gender.toLowerCase() + '.ico>';
        filledInEditModal.find('.image').replaceWith(imageSrc);
        return filledInEditModal;
    }

});