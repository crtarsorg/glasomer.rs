window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        initCategoriesWithQuestions($(this.el), this.template);

        Handlebars.registerHelper('setIndex', function (value) {
            this.name = value;
        });

        Handlebars.registerHelper('if_eq', function (a, b, opts) {
            if (a == b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        });
        return this
    },
    events: {
        "click #btn_save": "dataHandler"
    },
    dataHandler: function () {

        var category = $("#category").val();
        var answers_array = [];
        $(".question").each(function () {
            var answers_json = {};
            var name = $(this).find("div").find("h3").text().trim();

            var selected_answer = $("input[name='" + name + "']:checked").val();

            answers_json = {
                question: name,
                answer: selected_answer
            };

            $(':radio:checked', '.question-fieldset').map(function() {

                var tmp_val;
                if(answers_json.answer != undefined){
                    tmp_val = this.value;
                }
                else{
                    tmp_val = undefined;
                }
                answers_json['importance_level'] = tmp_val;

            }).get();

            if(answers_json['question'] != ""){
                answers_array.push(answers_json);
            }

        });

        var budget_items = ["Vojska", "Kultura", "Socijalna_zažtita", "Policija", "Nauka", "Zdravstvo", "Obrazovanje"];
        var inc_checkboxes = [];
        $('input:checkbox.css-checkbox', ".increase_budget_chb").each(function () {

            var checkedValue = (this.checked ? $(this).val() : "");
            if (checkedValue != ""){
                inc_checkboxes.push(checkedValue);
            }
        });

        var dec_checkboxes = [];
        $('input:checkbox.css-checkbox', ".decrease_budget_chb").each(function () {

            var checkedValue = (this.checked ? $(this).val() : "");
            if (checkedValue != ""){
                dec_checkboxes.push(checkedValue);
            }

        });

        var ch_b_json = {
            question: "Budžetski prioriteti",
            answer: {
                increase: inc_checkboxes,
                decrease: dec_checkboxes
            }
        };
        answers_array.push(ch_b_json);

        if (answers_array.length < 5) {
            alert("Morate popuniti sva polja da biste nastavili!");
        }
        else {
            // Switch to results' view
            var resultView = new ResultView({element: "#container", data: answers_array});
        }
    }

});

window.ResultView = Backbone.View.extend({
    template: JST["app/templates/results.hbs"],
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {

        var profiles = partiesProfiles();
        var matchingResult;
        var template = this.template;

        Handlebars.registerHelper('json', function(context) {
            return JSON.stringify(context);
        });

        readTextFile("app/static/questions.json", function (respJson) {
            var json_handler = JSON.parse(respJson);
            var partyMatcher = initPartiesCounter();

            var answers_collection = [];
            // Calculate matching result
            for (var item in options.data){
                if(options.data[item]['question'] != '' && options.data[item]['answer'] != undefined){
                    matchingResult = calculateMatchingResult(json_handler, options.data[item]);

                    if (!$.isEmptyObject(matchingResult['answer_collection']['parties'])){
                        answers_collection.push(matchingResult['answer_collection']);
                    }

                    $.each(partyMatcher, function(key, val){
                        partyMatcher[key] = val + matchingResult['matcher'][key]
                    });
                }

            }

            var resultJson = [];
            $.each(partyMatcher, function(key, value){
                var val = Math.round(value);
                var new_json = {
                    "partyName": key,
                    "matchingResult": val,
                    "profile": profiles[key]
                };
                resultJson.push(new_json);

            });

            resultJson = resultJson.sort(function(a, b) { return a.matchingResult < b.matchingResult ? 1 : -1; }).slice(0,3);

            var answers_array = [];
            for(var item in json_handler){
                for (var element in json_handler[item]) {
                    if (json_handler[item][element]['question'] != undefined){
                        $.each(answers_collection, function(index, sub_item){
                            if (json_handler[item][element]['question'] == sub_item['question']) {
                                var tmp_json = {
                                    question: json_handler[item][element]['question'],
                                    parties: json_handler[item][element]['politiciansAnswers']
                                };
                                tmp_json['parties']['Users Answer'] = sub_item['parties']['Users Answer'];
                                answers_array.push(tmp_json);
                            }
                        });
                    }
                }
            }

            $.each(answers_collection, function(index, item){

                var new_json = {
                    question: item['question'],
                    parties: {}
                };

                $.each(resultJson, function(key, value){
                    new_json['parties'][value['partyName']] = item['parties'][value['partyName']];

                });
                new_json['parties']['Users Answer'] = item['parties']['Users Answer'];
                answers_collection[index] = new_json;
            });

            $(options.element).html(template({results: resultJson, all_answers: answers_array, answers_matched: answers_collection }));

        });

        $.ajax({
            type: "POST",
            url: "http://opendatakosovo.org/api/glasomer/api/save",
            data: JSON.stringify(options.data),
            contentType: "application/json"
        }).fail(function(err) {
            console.log('An error occurred!')
        });

    }
});

function calculateMatchingResult(politicianAnswers, userAnswer){

    // Constants used to calculate the matching results, dual quote: 2.17391304
    var SINGLE_MATCHING_QT = 1.0869565;
    // var DOUBLE_MATCHING_QT = 1.88679;

    var partyMatcher = initPartiesCounter();
    var user_match_answer = {
        parties: {}
    };
    $.each(politicianAnswers, function(key, item){


        if (item["question"] != "Budžetski prioriteti" && userAnswer['question'] != "Budžetski prioriteti") {

            $.each(item, function (key, party) {

                if (party['question'] == userAnswer['question']){

                    user_match_answer['question'] = userAnswer['question'];
                    $.each(party['politiciansAnswers'], function(prop, val){

                        if (userAnswer['answer'] == party['politiciansAnswers'][prop]['answer']){

                            var first_match_qt = SINGLE_MATCHING_QT;
                            if(userAnswer['importance_level'] == party['politiciansAnswers'][prop]['importance']){

                                first_match_qt = first_match_qt + SINGLE_MATCHING_QT;
                            }
                            partyMatcher[prop] = first_match_qt;
                        }

                        user_match_answer['parties'][prop] = party['politiciansAnswers'][prop]
                    });

                }
            });

            user_match_answer['parties']['Users Answer'] = {answer: userAnswer['answer'], importance: userAnswer['importance_level']};

        }
        //else if (item["question"] == "Budžetski prioriteti" && userAnswer['question'] == "Budžetski prioriteti"){
        //
        //    $.each(item['politiciansAnswers'], function (key, party) {
        //
        //        $.each(party['increase'], function(indx, val){
        //            if (isInArray(val, userAnswer['answer'])){
        //                partyMatcher[key] = partyMatcher[key] + DOUBLE_MATCHING_QT;
        //            }
        //        });
        //    });
        //}
    });

    return {matcher: partyMatcher, answer_collection: user_match_answer};
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function initCategoriesWithQuestions(el, template) {
    readTextFile("app/static/questions.json", function (text) {
        var json_data = JSON.parse(text);

        var categories = [];
        for (var category in json_data){

            var questions = [];
            for (var question in json_data[category]){

                var question_text = json_data[category][question]['question'];
                var question = getQuestion(question_text, ["Slažem se", "Ne slažem se", "Nemam stav"]);
                questions.push(question);
            }

            categories.push({"name": category, "questions": questions});
        }
        var jsonString = JSON.stringify(categories);
        el.html(template({categories: JSON.parse(jsonString)}));

    })
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function getQuestion(text, answers) {
    var possible_answers = getAnswers(answers);
    return {text: text, possibleAnswers: possible_answers};
}

function getAnswers(answers) {
    var answers_collection = new Answers([]);
    for (var i = 0; i < answers.length; i++) {
        var answer = new Answer({text: answers[i], value: answers[i]});
        answers_collection.push(answer);
    }
    return answers_collection;
}


function partiesProfiles(){
    //"Srpska napredna stranka": "Srpska napredna stranka osnavana je u septembru 2008. godine, kada je grupa od 17 poslanika napustila Srpsku radikalnu stranku i predvođena tadašnjim zamenikom predsednika SRS-a Tomislavom Nikolićem osnovala poslanički klub “Napred Srbijo”. Razlog sukoba radikala i naprednjaka bila je odluka Tomislava Nikolića da u skupštini podrži Sporazum o stabilizaciji i pridruživanju sa EU. U maju 2012. godine održani su prevremeni parlamentarni i predsednički izbori. Koalicija stranaka okupljena oko SNS osvojila je 24,04 odsto glasova (73 poslanika) na parlamentarnim izborima, a na predsedničkim izborima Tomislav Nikolić pobedio je Borisa Tadića i postao novi predsednik Srbije. Novu Vladu Srbije u julu 2012. formirali su SNS, SPS i URS. Na vanrednim parlamentarnim izborima u martu 2014. koalicija okupljena oko SNS osvojila je ubedljivu većinu od 48,35 odsto glasova (158 poslaničkih mesta), a Aleksandar Vučić postao je predsednik Vlade Srbije.",

    return {
        "Demokratska stranka Srbije": {
            text: "Demokratska stranka Srbije izdvojila se iz Demokratske stranke 1992. godine, a na osnivačkoj skupštini za predsednika je izabran Vojislav Koštunica. Na predsedničkim, saveznim i lokalnim izborima 2000. stranka je nastupila u okviru Demokratske opozicije Srbije. Na ovim izborima Vojislav Koštunica izabran je za predsednika SR Jugoslavije, a DSS je osvojila deset mandata u Saveznoj skupštini. Na parlamentarnim izborima u decembru 2000. stranka je takođe izašla u okviru koalicije DOS i pripalo joj je 45 mandata. Sve do avgusta 2001. DSS je imala predstavnike u Vladi Republike Srbije, kada je DSS objavila da istupa iz kabineta. Na izborima za Skupštinu Srbije u decembru 2003. godine, DSS osvaja 53 poslanička mandata, a za premijera je izabran Koštunica. Nakon proglašenja Ustava 2006. godine, održani su izbori u januaru 2007, na kojima je DSS osvojila 33 mandata, a Vojislav Koštunica je ponovo izabran za premijera. Posle jednostranog proglašenja nezavisnosti Kosova 2008, Koštunica je zatražio raspisivanje vanrednih parlamentarnih izbora. Na njima je DSS osvojila 20 poslaničkih mesta i prešla u opoziciju. Na izborima u maju 2012. DSS osvojila je sedam odsto glasova (21 poslanik), a na vanrednim parlamentarnim izborima u martu 2014. DSS nije uspela da preskoči cenzus od pet odsto, jer je osvojila 4,4 odsto glasova. Nakon izbronog neuspeha Koštunica podnosi ostavku i napušta politiku, a na nejgovom mesto dolazi Sanda Rašković Ivić.",
            imgUrl: ''
        },
        "Demokratska stranka": {
            text: "Osnivačka skupština Demokratske stranke održana je 3. februara 1990. u Beogradu. U januaru 2000. godine Demokratska stranka pristupa savezu Dekomkratske opozicije Srbije, sa ciljem da sruši režim Slobodana Miloševića. Nakon petooktobarskih demonstracija, koje je DOS oragnizovao zbog izborne krađe, Slobodan Milošević podnosi ostavku, a za novog predsednika je proglašen Vojislav Koštunica. Skupština Srbije je raspuštena, a na vanrednim izborima 23. decembra 2000. DOS je odneo ubedljivu pobedu. Za novog predsednika Vlade Srbije izabran je Zoran Đinđić. Predsednik DS i premijer Srbije, Zoran Đinđić ubijen je 12. marta 2003. godine. Nakon ubistva premijera za predsednika DS-a, a i Srbije, 2004. godine izabran je Boris Tadić. Nakon dva mandata na mestu predsednika Srbije, Boris Tadić 2012. godine gubi od Tomislava Nikolića u drugom krugu predsedničkih izbora, a DS se seli u opoziciju. Tadića na čelu demokrata smenjuje Dragan Đilas, a Tadić tada sa jednim brojem visokih funkcionera napušta stranku. Na izborima u martu 2014. Demokratska stranka osvojila je 6,03 odsto glasova (19 poslanika), a na nakon toga za predsednika DS izabran je Bojan Pajtić.",
            imgUrl: ''
        },
        "Dosta je bilo": {
            text: "Pokret „Dosta je bilo - Saša Radulović“ osnovan je 27. januara 2014. godine, samo tri dana nakon što je Saša Radulović podneo ostavku na mesto ministra privrede u Vladi Ivice Dačića, i zajedno sa svojim saradnicima odlučio da izađe na izbore. Mesec dana kasnije, na parlamentarnim izborima u martu 2014. godine, Pokret je osvojio 2,1 odsto glasova. Na izbore 2016. godine izlaze sa “Planom u 20 tačaka – Poslednji voz sa Srbiju”.",
            imgUrl: ''
        },
        "Pokret Dveri": {
            text: "Srpski pokret Dveri je organizacija proistekla iz časopisa „Dveri srpske“ osnovanog na Savindan 1999. godine kao glasilo studenata srbistike Filološkog fakulteta u Beogradu. Srpski sabor Dveri osmišljen je kao pokret bez vođe. Glavni organ pokreta je Upravni odbor. U februaru 2011. godine Srpski sabor Dveri objavio je ulazak u politiku i izašli su na parlamentarne izbore 2012. godine sa izbornom listom pod nazivom „Dveri za život Srbije“. Osvojili su 4, 34 odsto glasova i nisu uspeli da uđu u Skupštinu Srbije. Kandidat Dveri na predsedničkim izborima bio je Vladan Glišić, koji je stranku napustio u avgustu 2008. godine. Ni na vanrednim parlamentarnim izborima 2014. Dveri nisu uspele da obezbede parlamentarni status, jer su osvojili 3,58 odsto glasova.",
            imgUrl: ''
        },
        "Liberalno demokratska stranka": {
            text: "Liberalno demokratska partija je osnovana 5. novembra 2005. godine u Beogradu. Nakon što je podneo zahtev za formiranje Liberalno-demokratske frakcije u okviru Demokratske stranke u novembru 2004, Čedomir Jovanović, bivši potpredsednik DS i Vlade Srbije, isključen je iz DS. Osnivačka skupština LDP održana je u novembru 2005, a za predsednika stranke je izabran Čedomir Jovanović. LDP je oktobra 2006. godine učestvovala u kampanji protiv usvajanja novog ustava Srbije. Na izborima u maju 2012. LDP nastupila je u koaliciji stranaka pod nazivom “Preokret – Čedomir Jovanović”, koja je osvojila 6,52 odsto glasova (19 poslanika). Na vanrednim parlamentarnim izborima u martu 2014. LDP nastupa u koaliciji stranaka pod nazivom “Čedomir Jovanović - LDP, BDZS, SDU” (Liberalno demokratska partija, Bošnjačka demokratska zajednica Sandžaka, Socijalno demokratska unija), ali ne uspeva da preskoči cenzus od pet odsto, osvojivši 3,36 odsto. Sve vreme svog delovanja LDP je provela u opoziciji.",
            imgUrl: ''
        },
        "Nova stranka": {
            text: "Nova stranka osnovana je 7. aprila 2013. godine u Beogradu. Njen osnivač, prvi i sadašnji predsednik je bivši predsednik Vlade Srbije i nekadašnji zamenik predsednika Demokratske stranke Zoran Živković. Nova stranka učestvovala je na republičkim izborima i izborima za odbornike Skupštine grada Beograda 16. marta 2014. godine na listi 'Sa Demokratskom strankom za demokratsku Srbiju'. Nakon izbora, NOVA je postala parlamentarna stranka sa dva osvojena mandata u Skupštini Srbije i jednim odborničkim mestom u Skupštini grada Beograda.",
            imgUrl: ''
        },
        "Savez vojvođanskih Mađara": {
            text: "Savez vojvođanskih Mađara je mađarska politička partija u Srbiji. Jedan od osnivača i dugogodišnji predsednik SVM-a bio je Jožef Kasa. Sadašnji predsednik stranke je Ištvan Pastor. SVM je osnovan 18. juna 1994. u Senti kao udruženje građana, a 17. juna 1995. godine je transformisan u političku stranku. Na izborima 24. septembra 2000. godine SVM je sa koalicijom DOS uspeo da postane parlamentarna stranka, a njen lider, Jožef Kasa, postao je potpredsednik Vlade Srbije. Ištvan Pastor je 2007. postao predesdnik SVM, a na tu funkciju je do danas biran tri puta. Nakon izbora 2012. godine postao je predsednik Skupštine AP Vojvodine. Na parlamentarnim izborima u Srbiji 2007. SVM osvaja tri mandata, a 2008. četiri. U maju 2012. na parlamentarnim izborima SVM osvaja pet mandata, a na vanrednim parlamentarnim izborima 2014. šest mandata. Istog dana kada je formirana nova Vlada Srbije, 27. aprila 2014, i Savez vojvođanskih Mađara potpisuje koalicioni sporazum sa Srpskom naprednom strankom",
            imgUrl: ''
        },
        "Srpska radikalna stranka": {
            text: "Srpska radikalna stranka nastala je iz Srpskog slobodarskog pokreta, osnovanog januara 1990. godine. Marta iste godine tom pokretu se pridružila grupa disidenata koji su, nakon istupanja iz Srpske narodne obnove, formirali Srpski četnički pokret na čelu sa Vojislavom Šešeljom. Nakon ujedinjenja sa Narodnom radikalnom strankom, koju je predvodio Tomislav Nikolić, stranka dobija ime Srpska radikalna stranka. Predsednik stranke i Centralne otadžbinske uprave je Vojislav Šešelj. U periodu od 1992. do 1993. SRS je podržavala vladu SPS-a. SRS je od 1998. do 2000. godine bila u vlasti sa SPS i JUL. Od oktobra 2000. SRS se nalazi u opoziciji, iako je do 2008. bila najjača politička stranka u Srbiji. Te godine deo stranke, na čelu sa Tomislavom Nikolićem, odvaja se i formira Srpsku naprednu stranku. Na sledećim izborima u maju 2012. godine okrnjena SRS ostaje ispod cenzusa, osvojivši 4,63 odsto glasova, a ni na vanrednim parlamentarnim izborima u martu 2014. SRS nije uspela da preskoči prag od pet odsto, osvojivši svega 2,01 odsto glasova.",
            imgUrl: ''
        },
        "Socijaldemokratska stranka Srbije": {
            text: "Socijaldemokratska stranka osnovana 18. jula 2014. godine, a registrovana u avgustu 2014. Osnivač i predsednik stranke je Boris Tadić, bivši predsednik Srbije i Demokratske stranke. Kada je 30. januara 2014. godine podneo ostavku na članstvo u DS zbog “neslaganja sa politikom aktuelnog rukovodstva” za njim je iz stranke istupilo više funkcionera DS. Na vanredne parlamentarne izbore 2014. godine stranka je izašla pod nazivom Nova demokrstska stranka, u koaliciji sa još nekoliko stranaka, i pripalo im je 9 mandata. Na prvim neposrednim stranačkim izborima za predsednika Nove demokratske stranke u oktobru 2014. izabran je Boris Tadić, a stranka je promenila naziv u Socijaldemokratska stranka.",
            imgUrl: ''
        },
        "Levica Srbije": {
            text:"Nekadašnji potpredsednik DS i šef poslaničke grupe u Skupštini Srbije Borko Stefanović, nakon napuštanja Demokratske stranke zbog “programskih i ideoloških razlika”, osniva pokret “Levica Srbije”. Na parlamentarne izbore 2016. godine ovaj pokret izlazi sa planom pod nazivom “Srbija posle Vučića”. Ideološki program i manifest Levice je pisao sociolog Jovo Bakić, koji je nakon toga optužio Stefanovića da želi “uspeh preko noći” i objavio da neće pristušiti pokretu.",
            imgUrl: ''
        }

    };
}

function initPartiesCounter(){
    return {
        "Demokratska stranka Srbije": 0,
        "Demokratska stranka": 0,
        "Dosta je bilo": 0,
        "Pokret Dveri": 0,
        "Liberalno demokratska stranka": 0,
        "Nova stranka": 0,
        "Savez vojvođanskih Mađara": 0,
        "Srpska radikalna stranka": 0,
        "Socijaldemokratska stranka Srbije": 0,
        //"Srpska napredna stranka": 0,
        "Levica Srbije": 0

    };
}