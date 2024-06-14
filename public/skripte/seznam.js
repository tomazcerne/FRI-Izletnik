//var idStranke;
var priljubljeneDestinacije = [];

var baza = "tomazcerne";
var baseUrl = 'https://teaching.lavbic.net/api/OIS/baza/'+ baza;

var weatherAPIurl = "https://api.weatherbit.io/v2.0";
var APIKey = "6e4aa0d252bb451c9778439f2cb6b959";
var APINapaka = '\
  <div class="imeKraja">\
    Ups, prišlo je do napake pri dostopu do podatkov!<br>\
    Možni vzroki: nedelovanje internetne povezave, presežena omejitev 50-ih\
    klicov na dan, nedosegljivost Weatherbit API-ja, ...\
  </div>';

// Objekt z zemljevidom
var mapa;

// objekt, ki hrani pot
var pot;
var tockePoti = [];

// Seznam z oznakami na zemljevidu
var markerji = [];

// GPS koordinate FRI
const FRI_LAT = 46.05004;
const FRI_LNG = 14.46931;

const dneviVTednu = ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota'];
const danesJutri = ['danes', 'jutri'];

const testData = '{"city_name":"Ljubljana","country_code":"SI","data":[{"app_max_temp":16.1,"app_min_temp":1.9,"clouds":75,"clouds_hi":0,"clouds_low":74,"clouds_mid":68,"datetime":"2023-05-18","dewpt":7.7,"high_temp":16.1,"low_temp":8.8,"max_dhi":null,"max_temp":16.1,"min_temp":5.4,"moon_phase":0.000584267,"moon_phase_lunation":0.98,"moonrise_ts":1684377604,"moonset_ts":1684435368,"ozone":352.5,"pop":0,"precip":0,"pres":983.9,"rh":67,"slp":1020.2,"snow":0,"snow_depth":0,"sunrise_ts":1684380400,"sunset_ts":1684434723,"temp":13.9,"ts":1684393260,"uv":6.3,"valid_date":"2023-05-18","vis":24.128,"weather":{"icon":"c04d","description":"Oblačno","code":804},"wind_cdir":"JV","wind_cdir_full":"jugovzhod","wind_dir":126,"wind_gust_spd":6,"wind_spd":2.8},{"app_max_temp":15.5,"app_min_temp":8.8,"clouds":89,"clouds_hi":37,"clouds_low":92,"clouds_mid":80,"datetime":"2023-05-19","dewpt":8.9,"high_temp":15.5,"low_temp":11.2,"max_dhi":null,"max_temp":15.5,"min_temp":8.8,"moon_phase":0.0155847,"moon_phase_lunation":0.01,"moonrise_ts":1684465433,"moonset_ts":1684526090,"ozone":350.6,"pop":0,"precip":0,"pres":984.7,"rh":80,"slp":1021.3,"snow":0,"snow_depth":0,"sunrise_ts":1684466736,"sunset_ts":1684521191,"temp":12.4,"ts":1684447260,"uv":4.1,"valid_date":"2023-05-19","vis":24.128,"weather":{"icon":"c04d","description":"Oblačno","code":804},"wind_cdir":"JJV","wind_cdir_full":"jug-jugovzhod","wind_dir":152,"wind_gust_spd":3.9,"wind_spd":2},{"app_max_temp":18.7,"app_min_temp":11.2,"clouds":82,"clouds_hi":56,'+
'"clouds_low":58,"clouds_mid":66,"datetime":"2023-05-20","dewpt":11.6,"high_temp":19.1,"low_temp":11.3,"max_dhi":null,"max_temp":19.1,"min_temp":11.2,"moon_phase":0.0524774,"moon_phase_lunation":0.05,"moonrise_ts":1684553581,"moonset_ts":1684616418,"ozone":343.5,"pop":90,"precip":15.9,"pres":981.7,"rh":81,"slp":1017.9,"snow":0,"snow_depth":0,"sunrise_ts":1684553073,"sunset_ts":1684607659,"temp":15.1,"ts":1684533660,"uv":7.4,"valid_date":"2023-05-20","vis":23.702,"weather":{"icon":"r03d","description":"Močan dež","code":502},"wind_cdir":"J","wind_cdir_full":"jug","wind_dir":187,"wind_gust_spd":4.3,"wind_spd":2.1},{"app_max_temp":22.5,"app_min_temp":11.3,"clouds":51,"clouds_hi":0,"clouds_low":36,"clouds_mid":19,"datetime":"2023-05-21","dewpt":11.9,"high_temp":22.9,"low_temp":10.8,"max_dhi":null,"max_temp":22.9,"min_temp":11.3,"moon_phase":0.107775,"moon_phase_lunation":0.08,"moonrise_ts":1684642172,"moonset_ts":1684706160,"ozone":342.7,"pop":65,"precip":5.5,"pres":973.5,"rh":74,"slp":1015.1,"snow":0,"snow_depth":0,"sunrise_ts":1684639412,"sunset_ts":1684694125,"temp":17.2,"ts":1684620060,"uv":9,"valid_date":"2023-05-21","vis":24.128,"weather":{"icon":"r02d","description":"Zmeren dež","code":501},"wind_cdir":"J","wind_cdir_full":"jug","wind_dir":188,"wind_gust_spd":4.5,"wind_spd":2.4}],"lat":46.0527,"lon":14.4719,"state_code":"61","timezone":"Europe/Ljubljana"}'

const imeDneva = (date, indeks) => {
  if (indeks <= 1) {
    return danesJutri[indeks];
  }
  let datum = new Date(date);
  let dan = datum.getDay();
  return dneviVTednu[datum.getDay()];
}

const formatDate = (date) => {
  let tab = date.split("-");
  let leto = tab[0];
  let mesec = tab[1];
  let dan = tab[2];
  return dan +". "+ mesec +". ";
}

const pridobiVremenskePodatke = (lat, lng, stDni, callback) => {
  /**/let link = weatherAPIurl + '/forecast/daily?key='+ APIKey + '&lang=sl' +
  '&days='+ stDni +'&lat='+ lat +'&lon='+ lng;
  $.ajax({
    url: link,
    type: "GET",
    contentType: 'application/json',
    success: function (podatki) {
        console.log(JSON.stringify(podatki));
        callback(podatki);
    },
    error: function (err) {
        console.log(err);
        callback(null);
    }
  });//*/ callback(JSON.parse(testData));
}

const odstraniVreme = (indeks, lat, lng) => {
  $("#seznamPriljubljenih #"+ indeks +" .okvirVreme").html("");
  $("#seznamPriljubljenih #"+ indeks +" .klikVreme").html('\
    <span onclick="prikazVremena('+ indeks +', '+ lat + ', '+ lng +')">\
      <i class="fa-solid fa-cloud-sun-rain vreme"></i>\
    </span>');
}

const odstraniGraf = (indeks, lat, lng) => {
  $("#seznamPriljubljenih #"+ indeks +" .okvirGraf").html("");
  $("#seznamPriljubljenih #"+ indeks +" .klikGraf").html('\
    <span onclick="prikazGrafa('+ indeks +', '+ lat + ', '+ lng +')">\
    <i class="fa-solid fa-chart-line graf"></i>\
    </span>');
}

const prikazVremena = (indeks, lat, lng) => {

  $("#seznamPriljubljenih #"+ indeks +" .klikVreme").html('\
    <span onclick="odstraniVreme('+ indeks +', '+ lat + ', '+ lng +')">\
      <i class="fa-solid fa-chevron-up zapri"></i>\
    </span>');
  
  pridobiVremenskePodatke(lat, lng, 4, (weatherData) => {
    if (weatherData == null) {
      $("#seznamPriljubljenih #"+ indeks +" .okvirVreme").html(APINapaka);
      return;
    }
    let prikaz = '\
    <div class="imeKraja"> Vremenska napoved za kraj: <strong>'
    + weatherData.city_name +'</strong> </div>\
    <div class="dnevi"></div>';
    $("#seznamPriljubljenih #"+ indeks +" .okvirVreme").html(prikaz);
    
    let dnevi = weatherData.data;
    for (let i = 0; i < dnevi.length; i++) {
      let dan = dnevi[i];
      let vreme = dan.weather;
      let imageLink = 'https://cdn.weatherbit.io/static/img/icons/'+ vreme.icon +'.png';
      let prikazDan = '\
      <div class="dan">\
        <div class="imeDneva">'+ imeDneva(dan.valid_date, i) +'</div>\
        <div class="datum">'+ formatDate(dan.valid_date) +'</div>\
        <img class="vremeIkona" src="'+ imageLink +'" alt="'+ vreme.description +'">\
        <div class="vremeOpis">'+ vreme.description +'</div>\
        <div class="temperatura">\
          <span class="nizka"><strong>'+ Math.round(dan.low_temp) +'</strong>\u00B0C</span>\
           / \
          <span class="visoka"><strong>'+ Math.round(dan.high_temp) +'</strong>\u00B0C</span>\
        </div>\
      </div>';
      $("#seznamPriljubljenih #"+ indeks +" .okvirVreme .dnevi").append(prikazDan);
    }

  });
}
const prikazGrafa = (indeks, lat, lng) => {
  $("#seznamPriljubljenih #"+ indeks +" .klikGraf").html('\
    <span onclick="odstraniGraf('+ indeks +', '+ lat + ', '+ lng +')">\
      <i class="fa-solid fa-chevron-up zapri"></i>\
    </span>');
  
  pridobiVremenskePodatke(lat, lng, 7, (weatherData) => {
    if (weatherData == null) {
      $("#seznamPriljubljenih #"+ indeks +" .okvirGraf").html(APINapaka);
      return;
    }

    $("#seznamPriljubljenih #"+ indeks +" .okvirGraf").html('\
      <div class="naslovGrafa"> Grafični prikaz temperatur: <strong>'
      + weatherData.city_name +'</strong></div>\
      <div class="canvas"></div>\
    ');

    let visokeTemp = [];
    let nizkeTemp = [];
    let dnevi = weatherData.data;
    for (let i = 0; i < dnevi.length; i++) {
      let dan = dnevi[i];
      let datum = new Date(dan.valid_date);
      visokeTemp.push({x: datum, y: dan.high_temp});
      nizkeTemp.push({x: datum, y: dan.low_temp});
    }

    let podatkiGrafa = {
      animationEnabled: true,
      axisX:{
        valueFormatString: "DD. MM."
      },
      axisY: {
        suffix: "\u00B0C"
      },
      toolTip:{
        shared: true
      },  
      legend:{
        verticalAlign: "bottom",
        horizontalAlign: "center",
      },
      data: [{
        type: "line",
        showInLegend: true,
        name: "viskoka temperatura",
        markerType: "circle",
        xValueFormatString: "DD. MM. YYYY",
        color: "red",
        yValueFormatString: "##.#\u00B0C",
        dataPoints: visokeTemp
      },
      {
        type: "line",
        showInLegend: true,
        name: "nizka teperatura",
        markerType: "circle",
        yValueFormatString: "##.#\u00B0C",
        color: "blue",
        dataPoints: nizkeTemp
      }]
    };
    $("#seznamPriljubljenih #"+ indeks +" .okvirGraf .canvas").CanvasJSChart(podatkiGrafa);

  });
}

const seznamPriljubljenih = () => {
  $("#seznamPriljubljenih").html("");
  if (priljubljeneDestinacije.length == 0) {
    $("#seznamPriljubljenih").html("<p>ni priljubljenih destinacij</p");
  }
  for (let i = 0; i < priljubljeneDestinacije.length; i++) {
    let destinacija = priljubljeneDestinacije[i];
    let prikaz = '\
    <div class="priljubljena" id="'+ i +'"> \
      <span class="ime"><strong>'+ destinacija.ime +'</strong></span> \
      <span class="klikVreme"> \
        <span onclick="prikazVremena('+ i +', '+ destinacija.lat +
        ', '+ destinacija.lng +')">\
        <i class="fa-solid fa-cloud-sun-rain vreme"></i>\
        </span>\
      </span> \
      <span class="klikGraf"> \
        <span onclick="prikazGrafa('+ i +', '+ destinacija.lat +
        ', '+ destinacija.lng +')">\
        <i class="fa-solid fa-chart-line graf"></i>\
        </span>\
      </span> \
      <div class="okvirVreme"></div>\
      <div class="okvirGraf"></div>\
    </div>';
    $("#seznamPriljubljenih").append(prikaz);
  }
  
} 

const indexPriljubljene = (id) => {
  for (let i = 0; i < priljubljeneDestinacije.length; i++) {
    let destinacija = priljubljeneDestinacije[i];
    if (destinacija.id == id) {
      return i;
    }
  }
  return -1;
}

const pridobiIzBaze = (callback) => {
  $.ajax({
    url: baseUrl + '/podatki/vrni/'+ idStranke,
    type: "GET",
    contentType: 'application/json',
    success: function (data) {
      callback(data);
    },
    error: function (err) {
      callback(priljubljeneDestinacije);
    }
  });
}

const posodobiBazo = () => {
  $.ajax({
    url: baseUrl + '/podatki/azuriraj?kljuc='+ idStranke +'&elementTabele=false',
    type: "PUT",
    contentType: 'application/json',
    data: JSON.stringify(priljubljeneDestinacije),
    success: function (data) {
        seznamPriljubljenih();
    },
    error: function (err) {
      console.log("napaka");
    }
  });
}

// Premakni destinacijo iz seznama (desni del) v košarico (levi del)
const premakniDestinacijoIzSeznamaVKosarico = (id, ime, lat, lng, azuriraj) => {
  if (azuriraj)
    $.get("/kosarica/" + id, (podatki) => {
      /* Dodaj izbrano destinacijo v sejo */
    });

  let unliked = "<i class='fa-regular fa-heart srce praznoSrce'></i>";
  let liked = "<i class='fa-solid fa-heart srce polnoSrce'></i>";
  let srce;
  srce = (indexPriljubljene(id) >= 0) ? liked : unliked;
  
  // Dodaj destnacijo v desni seznam
  $("#kosarica").append(
    "<div id='" +
      id +
      "' class='destinacija'> \
             <button type='button' class='btn btn-light btn-sm'> \
               <i class='fas fa-minus'></i> \
                 <strong><span class='ime' dir='ltr'>" +
      ime +
      "</span></strong> \
            <!--<i class='fas fa-signal'></i>--><span style='display: none' class='lat'>" +
      lat +
      "</span>\
            <!--<i class='far fa-clock'></i>--><span class='lng' style='display: none'>" +
      lng +
      "</span><!-- min -->\
              </button> \
              <span class='klikSrce'>" +
              srce
              + "</span> \
               <input type='button' onclick='podrobnostiDestinacije(" +
      id +
      ")' class='btn btn-secondary btn-sm' value='...'> \
              </div>"
  );

  $("#kosarica #" + id + " .klikSrce").click(function () {
    let indeks = indexPriljubljene(id);
    if (indeks >= 0) {
      priljubljeneDestinacije.splice(indeks, 1);
      $(this).html(unliked);
    }
    else {
      priljubljeneDestinacije.push({id: id, ime: ime, lat: lat, lng: lng});
      $(this).html(liked);
      
    }
    posodobiBazo();
    
  });

  // Dogodek ob kliku na destinacijo v košarici (na desnem seznamu)
  $("#kosarica #" + id + " button").click(function () {
    let destinacija_kosarica = $(this);
    $.get("/kosarica/" + id, (podatki) => {
      /* Odstrani izbrano destinacijo iz seje */
      // Če je košarica prazna, onemogoči gumbe za pripravo računa
      if (!podatki || podatki.length == 0) {
        $("#racun_html").prop("disabled", true);
        $("#racun_xml").prop("disabled", true);
      }
    });
    // odstrani marker
    for (let i = 0; i < markerji.length; i++) {
      let imeMarkerja = markerji[i].getPopup().getContent();
      if ( imeMarkerja == ime) {
        mapa.removeLayer(markerji[i]);
        markerji.splice(i, 1);
        break;
      }
    }
    prikazPoti();

    // Izbriši destinacijo iz desnega seznama
    destinacija_kosarica.parent().remove();
    // Pokaži destinacijo v levem seznamu
    $("#destinacije #" + id).show();
  });

  // Skrij destinacijo v levem seznamu
  $("#destinacije #" + id).hide();
  // Ker košarica ni prazna, omogoči gumbe za pripravo računa
  $("#racun_html").prop("disabled", false);
  $("#racun_xml").prop("disabled", false);

  dodajMarker(lat, lng, ime, "blue");
};

// Vrni več podrobnosti destinacije
const podrobnostiDestinacije = (id) => {
  $.get("/vec-o-destinaciji-api/" + id, (podatki) => {

    let prikazHTML = "";
    if (podatki == "napaka") {
      prikazHTML = "Podatki niso na voljo";
    }
    else {
      prikazHTML += "<b>Celoten naslov: </b>";
      let naslovi = podatki.address;
      for (let i = 0; i < naslovi.length; i++) {
        prikazHTML += (i > 0) ? ", " : "";
        prikazHTML += naslovi[i].localname;
      }
      prikazHTML += "<br>";

      if (podatki.extratags.website) {
        prikazHTML += "<b>URL: </b>";
        prikazHTML += "<a href='" + podatki.extratags.website + 
        "' target='_blank'>spletno mesto: </a><br>";
      }

      prikazHTML += "<b>Datum vnosa: </b>" + podatki.indexed_date;
    }

    $("#sporocilo").html("<div class='alert alert-info'>" + 
    "<small>" + prikazHTML + "</small></div>");
  });
};

function prikazPoti() {
  
  // Izbrišemo obstoječo pot, če ta obstaja
  if (pot != null) mapa.removeControl(pot);

  pot = L.Routing.control({
    draggable: false,
    addWaypoints: false,
    waypoints: markerji.map(marker => marker.getLatLng()),
    createMarker : function(i, waypoint) {},
    show: false,
    language: 'sl',
    lineOptions: {
      styles: [{color: '#4E732E', weight: 5, dashArray: '4.75'}]
    },
  }).addTo(mapa);

  // podrobnosti o poti, ko je ta najdena
  pot.on("routesfound", function (e) {
    koordinateIzbranePoti = e.routes[0].coordinates;
  });

}

$(document).ready(() => {

  $.ajaxSetup({cache: false});

  pridobiIzBaze((data) => {
    priljubljeneDestinacije = data;
    seznamPriljubljenih();
    // Posodobi podatke iz košarice na spletni strani
    $.get("/kosarica", (kosarica) => {
      kosarica.forEach((destinacija) => {
        premakniDestinacijoIzSeznamaVKosarico(
          destinacija.id,
          destinacija.ime,
          destinacija.zemljepisnaSirina,
          destinacija.zemljepisnaDolzina,
          false
        );
      });
    });

  });

  // Osnovne lastnosti mape
  var mapOptions = {
    center: [FRI_LAT, FRI_LNG],
    zoom: 7.5,
  };

  // Ustvarimo objekt mapa
  mapa = new L.map("mapa_id", mapOptions);

  // Ustvarimo prikazni sloj mape
  var layer = new L.TileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );

  // Prikazni sloj dodamo na mapo
  mapa.addLayer(layer);

  // Ročno dodamo FRI na mapo
  dodajMarker(
    FRI_LAT,
    FRI_LNG,
    "Fakulteta za računalništvo in informatiko",
    "yellow"
  );

  // Klik na destinacijo v levem seznamu sproži
  // dodajanje destinacije v desni seznam (košarica)
  $("#destinacije .destinacija button").click(function () {
    let destinacija = $(this);
    premakniDestinacijoIzSeznamaVKosarico(
      destinacija.parent().attr("id"),
      destinacija.find(".ime").text(),
      destinacija.find(".lat").text(),
      destinacija.find(".lng").text(),
      true
    );
  });

  // Klik na gumba za pripravo računov
  $("#racun_html").click(() => (window.location = "/izpisiRacun/html"));
  $("#racun_xml").click(() => (window.location = "/izpisiRacun/xml"));
});

/**
 * Dodaj izbrano oznako na zemljevid na določenih GPS koordinatah,
 * z dodatnim opisom, ki se prikaže v oblačku ob kliku in barvo
 * ikone, glede na tip oznake (FRI = črna, parki = zelena in
 * hoteli = modra)
 *
 * @param lat zemljepisna širina
 * @param lng zemljepisna dolžina
 * @param vsebinaHTML, vsebina v HTML obliki ki se prikaže v oblačku
 * @param barvaAnglesko, barva navedena v angleškem jeziku (npr. green, blue, black)
 */
function dodajMarker(lat, lng, vsebinaHTML, barvaAnglesko) {
  var streznik = "https://teaching.lavbic.net/cdn/OIS/DN/";
  var ikona = new L.Icon({
    iconUrl: streznik + "marker-icon-2x-" + barvaAnglesko + ".png",
    shadowUrl: streznik + "marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Ustvarimo marker z vhodnima podatkoma koordinat
  // in barvo ikone, glede na tip
  var marker = L.marker([lat, lng], { icon: ikona });
  if (vsebinaHTML != "Fakulteta za računalništvo in informatiko") {
    markerji.push(marker);
    prikazPoti(); 
  }
  // Izpišemo želeno sporočilo v oblaček
  marker.bindPopup(vsebinaHTML).openPopup();
  marker.addTo(mapa);
}
