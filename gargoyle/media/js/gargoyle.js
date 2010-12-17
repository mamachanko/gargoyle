$(document).ready(function () {
    var api = function (url, params, succ) {
        $.post(url, params, function (resp) {
            if (resp.success) {
                succ(resp.data);
            } else {
                alert(resp.data);
            }
        }, "json");
    };

    // Events

    $(".addSwitch").click(function (ev) {
        ev.preventDefault();
        $.facebox($("#switchForm").tmpl({ add: true }));
    });

    $(".switches .edit").live("click", function () {
        var row = $(this).parents("tr:first");

        $.facebox($("#switchForm").tmpl({
            add:    false,
            curkey: row.attr("data-switch-key"),
            key:    row.attr("data-switch-key"),
            name:   row.attr("data-switch-name"),
            desc:   row.attr("data-switch-desc")
        }))
    });

    $(".switches .delete").live("click", function () {
        var row = $(this).parents("tr:first");
        var table = row.parents("table:first");

        api(GARGOYLE.deleteSwitch, { key: row.attr("data-switch-key") },
            function () {
                row.remove();
                if (!table.find("tr").length) {
                    $("div.noSwitches").show();
                }
            });
    });

    $(".switches td.status button").live("click", function () {
        var row = $(this).parents("tr:first");
        var el = $(this);
        var status = el.attr("data-status");
        var labels = {
            3: "(Active for everyone)",
            2: "(Active for everyone)",
            1: "(Disabled for everyone)"
        };

        api(GARGOYLE.updateStatus,
            {
                key:    row.attr("data-switch-key"),
                status: status
            },

            function (swtch) {
                if (swtch.status == status) {
                    row.find(".toggled").removeClass("toggled");
                    el.addClass("toggled");
                    row.find('.status p').text(labels[swtch.status]);
                }
            });
    });

    $("p.addCondition a").live("click", function (ev) {
        ev.preventDefault();
        var form = $(this).parents("td:first").find("div.conditionsForm:first");

        if (form.is(":hidden")) {
            form.html($("#switchConditions").tmpl({}));
            form.show();
        } else {
            form.hide();
        }
    });
    
    $("div.conditionsForm select").live("change", function () {
        var field = $(this).val().split(",");
        $(this).
            parents("tr:first").
            find("div.fields").hide();

        $(this).
            parents("tr:first").
            find("div[data-path=" + field[0] + "." + field[1] + "]").show();
    });

    $("#facebox .closeFacebox").live("click", function (ev) {
        ev.preventDefault();
        $.facebox.close();
    });

    $("#facebox .submitSwitch").live("click", function () {
        var action = $(this).attr("data-action");
        var curkey = $(this).attr("data-curkey");

        api(action == "add" ? GARGOYLE.addSwitch : GARGOYLE.updateSwitch,
            {
                curkey: curkey,
                name:   $("#facebox input[name=name]").val(),
                key:    $("#facebox input[name=key]").val(),
                desc:   $("#facebox textarea").val()
            },

            function (swtch) {
                var result = $("#switchData").tmpl(swtch);

                if (action == "add") {
                    if ($("table.switches tr").length == 0) {
                        $("table.switches").html(result);
                        $("table.switches").removeClass("empty");
                        $("div.noSwitches").hide();
                    } else {
                        $("table.switches tr:last").after(result);
                    }

                    $.facebox.close();
                } else {
                    $("table.switches tr[data-switch-key=" + curkey + "]").replaceWith(result);
                    $.facebox.close();
                }
            });
    });
});
