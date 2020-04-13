
var URL_DONATION_DATA_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPadlpoqcDEHX16O3HoCQPjywGHpPgl-drqxvzV85Zp7GXwL_PNbUqvl8B6CRKeTokmvDrC1tDZtqA/pub?gid=0&single=true&output=csv';

var donation_wheel = {
    wheel: null,
    recipients: null,
    audio_tick: new Audio('audio/tick.mp3'),
    spinning: false,
    
    initDocument: function() {
        $(document).ready(function() {
            console.log("Document ready.");
            donation_wheel.readData();
        });
    },

    readData: function() {
        $.ajax({
            url: URL_DONATION_DATA_CSV,
            success: function(data) {
                console.log("Data CSV retrieved.");
                donation_wheel.recipients = $.csv.toObjects(data);
                console.log(donation_wheel.recipients);
                donation_wheel.onDataReady();
            },
            dataType: "text",
        });
    },

    onDataReady: function() {
        donation_wheel.initWheel();
    },

    startSpin: function() {
        if (!donation_wheel.spinning) {
            donation_wheel.wheel.animation.spins = 15;
            donation_wheel.wheel.startAnimation();
            donation_wheel.spinning = true;
        }
    },

    spinComplete: function(indicatedSegment) {
        // reset the wheel - a bit?!
        donation_wheel.spinning = false;
        donation_wheel.wheel.stopAnimation(false);
        donation_wheel.wheel.rotationAngle = 0;

        $('#selected_org_title').html(indicatedSegment.recipient.Project + ", " + indicatedSegment.recipient.Organisation);
        $('#selected_org_text').html(indicatedSegment.recipient.About);

        $('#selected_org_link_org').hide();
        $('#selected_org_link_donate').hide();
        $('#selected_org_link_about').hide();

        $('#result_section').show();
        
        var org_link = indicatedSegment.recipient['Organisation link'];
        var donate_link = indicatedSegment.recipient['Donate link'];
        var project_link = indicatedSegment.recipient['Project link'];

        if (org_link) {
            $('#selected_org_link_org').html(indicatedSegment.recipient.Organisation + "...");
            $('#selected_org_link_org').attr("href", org_link);
            $('#selected_org_link_org').show();
        } else {
            $('#selected_org_link_org').hide();
        }
        
        if (donate_link) {
            $('#selected_org_link_donate').attr("href", donate_link);
            $('#selected_org_link_donate').show();
        } else {
            $('#selected_org_link_donate').hide();
        }
        
        if (project_link) {
            $('#selected_org_link_about').attr("href", project_link);
            $('#selected_org_link_about').show();
        } else {
            $('#selected_org_link_about').hide();
        }

        $([document.documentElement, document.body]).animate({
            scrollTop: $("#result_section").offset().top
        }, 2000);
    },

    initWheel: function() {
        var colours = [ '#eae56f', '#89f26e', '#7de6ef', '#e7706f' ];
        //var colours = [ '#DAA520', '#D4AF37', '#EEE8AA', '#CFB53B', '#F0E68C', '#FFA500', '#C5B358', '#E6BE8A' ]; // gold colours

        var segments = [];
        var colourIndex = 0;
        for (var iter = 0; iter < 1; iter++) {
            for (var r = 0; r < donation_wheel.recipients.length; r++) {
                var recipient = donation_wheel.recipients[r];

                // pick and advance colour
                // var nextColour = colours[colourIndex];
                // colourIndex = colourIndex + 1; if (colourIndex == colours.length) { colourIndex = 0; }
                var value = (0.6 + (Math.random() * 0.25)) * 0xFF | 0;
                var grayscale = (value << 16) | (value << 8) | value;
                var nextColour = '#' + grayscale.toString(16);
                if (recipient['Segment override']) { nextColour = recipient['Segment override']; }

                // build segment
                var recipientSegment = { 
                    'fillStyle': nextColour, 
                    'text': recipient['Segment'], 
                    'recipient': recipient
                };
                segments.push(recipientSegment);
            }
        }

        donation_wheel.wheel = new Winwheel({
            'numSegments'   : segments.length, // Specify number of segments.
            'outerRadius'   : 212,  // Set radius to so wheel fits the background.
            //'innerRadius'   : 40,  // Set inner radius to make wheel hollow.
            'textFontSize'  : 14,   // Set font size accordingly.
            'textMargin'    : 0,    // Take out default margin.
            'segments'      : segments,
            'animation' :           // Define spin to stop animation.
            {
                'type'     : 'spinToStop',
                'duration' : 5,
                'spins'    : 8,
                'callbackFinished' : donation_wheel.spinComplete,
                'callbackSound'    : donation_wheel.playSound,
                'soundTrigger'     : 'pin'
            },
            'pins' :
            {
                'number' : segments.length * 2
            }
        });
    },

    playSound: function() {
        donation_wheel.audio_tick.pause();
        donation_wheel.audio_tick.currentTime = 0;
        donation_wheel.audio_tick.play();
    }
};

// initialise and register for document.ready
donation_wheel.initDocument();