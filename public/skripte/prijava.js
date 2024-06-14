const SENSEI_RACUN = "0x66d6fe6b4ecD30cB875c682FF7A2eFC432a1d076";
var prijavljenRacun;
var web3;

const donirajEthereum = async (modalnoOknoDoniraj) => {
  try {
      var posiljateljDenarnica = $("#eth-racun").attr("denarnica");
      var prejemnikDenarnica = $("#denarnica-prejemnika").val();
      var znesek = $("#donacija").val();

      if (znesek < 0.1 || znesek > 1) {
        $("#napakaDonacija").html(
          "<div class='alert alert-danger' role='alert'>" +
          "<i class='fas fa-exclamation-triangle me-2'></i>" +
          "Vrednost donacije mora biti med 0.1 in 1" +
          "</div>"
        );
        return;
      }

      let rezultat = await web3.eth.sendTransaction({
          from: posiljateljDenarnica,
          to: prejemnikDenarnica,
          value: znesek * Math.pow(10, 18),
      });

      // ob uspešni transakciji
      if (rezultat) {
          modalnoOknoDoniraj.hide();
      } else {
          // neuspešna transakcija
          $("#napakaDonacija").html(
              "<div class='alert alert-danger' role='alert'>" +
              "<i class='fas fa-exclamation-triangle me-2'></i>" +
              "Prišlo je do napake pri transakciji!" +
              "</div>"
          );
      }
  } catch (e) {
      // napaka pri transakciji
      $("#napakaDonacija").html(
          "<div class='alert alert-danger' role='alert'>" +
          "<i class='fas fa-exclamation-triangle me-2'></i>" +
          "Prišlo je do napake pri transakciji: " + e +
          "</div>"
      );
  }
};

/**
* Funkcija za prikaz donacij v tabeli
*/
const dopolniTabeloDonacij = async () => {
  try {
      let steviloBlokov = (await web3.eth.getBlock("latest")).number;
      let st = 1;
      $("#seznam-donacij").html("");
      for (let i = 0; i <= steviloBlokov; i++) {
          let blok = await web3.eth.getBlock(i);

          for (let txHash of blok.transactions) {
              let tx = await web3.eth.getTransaction(txHash);

              let vrednost = parseFloat(web3.utils.fromWei(tx.value));
              if (tx.to == SENSEI_RACUN && vrednost >= 0.1 && vrednost <= 1) {
                  $("#seznam-donacij").append("\
                  <tr>\
                      <th scope='row'>" + st++ + "</th>\
                      <td>" + okrajsajNaslov(tx.hash) + "</td>\
                      <td>" + okrajsajNaslov(tx.from) + "</td>\
                      <td>" + okrajsajNaslov(tx.to) + "</td>\
                      <td>" + vrednost + " <i class='fa-brands fa-ethereum'></i></td>\
                  </tr>");
              }
          }
      }
  } catch (e) {
      alert(e);
  }
};

function okrajsajNaslov(vrednost) {
  return vrednost.substring(0, 4) + "..." + vrednost.substring(vrednost.length - 3, vrednost.length);
}

/**
* Funkcija za prijavo Ethereum denarnice v testno omrežje
*/
const prijavaEthereumDenarnice = async (modalnoOknoPrijava) => {
  try {
      let rezultat = await web3.eth.personal.unlockAccount(
          $("#denarnica").val(),
          $("#geslo").val(),
          600);

      // ob uspešni prijavi računa
      if (rezultat) {
          prijavljenRacun = $("#denarnica").val();
          $("#eth-racun").html(okrajsajNaslov($("#denarnica").val()) + " (10 min)");
          $("#eth-racun").attr("denarnica", $("#denarnica").val());
          $("#gumb-doniraj-start").removeAttr("disabled");
          modalnoOknoPrijava.hide();
      } else {
          // neuspešna prijava računa
          $("#napakaPrijava").html(
              "<div class='alert alert-danger' role='alert'>" +
              "<i class='fas fa-exclamation-triangle me-2'></i>" +
              "Prišlo je do napake pri odklepanju!" +
              "</div>"
          );
      }
  } catch (napaka) {
      // napaka pri prijavi računa
      $("#napakaPrijava").html(
          "<div class='alert alert-danger' role='alert'>" +
          "<i class='fas fa-exclamation-triangle me-2'></i>" +
          "Prišlo je do napake pri odklepanju: " + napaka +
          "</div>"
      );

  }
};

/**
* Funkcija za dodajanje poslušalcev modalnih oken
*/
function poslusalciModalnaOkna() {
  const modalnoOknoPrijava = new bootstrap.Modal(document.getElementById('modalno-okno-prijava'), {
      backdrop: 'static'
  });

  const modalnoOknoDoniraj = new bootstrap.Modal(document.getElementById('modalno-okno-donacije'), {
      backdrop: 'static'
  });

  $("#denarnica,#geslo").keyup(function (e) {
      if ($("#denarnica").val().length > 0 && $("#geslo").val().length > 0)
          $("#gumb-potrdi-prijavo").removeAttr("disabled");
      else
          $("#gumb-potrdi-prijavo").attr("disabled", "disabled");
  });

  $("#gumb-potrdi-prijavo").click(function (e) {
      prijavaEthereumDenarnice(modalnoOknoPrijava);
  });

  $("#potrdi-donacijo").click(function (e) {
      donirajEthereum(modalnoOknoDoniraj);
  });

  var modalnoOknoDonacije = document.getElementById('modalno-okno-donacije');
  modalnoOknoDonacije.addEventListener('show.bs.modal', function (event) {
      var prijavljenaDenarnica = $("#eth-racun").attr("denarnica");
      $("#posiljatelj").text(prijavljenaDenarnica);
  });

  var modalnoOknoSeznamDonacij = document.getElementById('modalno-okno-seznam-donacij');
  modalnoOknoSeznamDonacij.addEventListener('show.bs.modal', function (event) {
      dopolniTabeloDonacij();
  });
}

$(document).ready(() => {

  /* Povežemo se na testno Ethereum verigo blokov */
  web3 = new Web3("https://sensei.lavbic.net:8546");

  /* Dodamo poslušalce */
  poslusalciModalnaOkna();

  $("#denarnica-prejemnika").val(SENSEI_RACUN);

  $("select#seznamRacunov").change(function (e) {
    let izbranRacunId = $(this).val();

    var pridobiSeznamDestinacij = new XMLHttpRequest();
    pridobiSeznamDestinacij.open("GET", "destinacije-racuna/" + izbranRacunId, true);
    pridobiSeznamDestinacij.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {

        let destinacije = JSON.parse(this.responseText);
        let skupnaCena = 0;
        let najdrazja = destinacije[0];
        destinacije.forEach((destinacija) => {
          let cena = destinacija.cena;
          skupnaCena += cena;
          if (cena > najdrazja.cena) {
            najdrazja = destinacija;
          }
        });

        skupnaCena = Math.round(skupnaCena * 100) / 100;
        document.querySelector("#skupnaCenaIzleta").innerHTML = "Skupna cena izleta znaša <b>" +
        skupnaCena.toFixed(2) + "</b> €, pri čemer je najdražja destinacija <b>" + najdrazja.ime + "</b>.";
      }
    }
    pridobiSeznamDestinacij.send();
  });
});

var vnosnoPolje = document.querySelector("#iskalniNiz");
vnosnoPolje.addEventListener("keyup", () => {
  let niz = vnosnoPolje.value.toLowerCase();
  let seznamRacunov = document.querySelector("#seznamRacunov");
  let opcije = seznamRacunov.getElementsByTagName("option");
  let prvi = true;
  for (let i = 0; i < opcije.length; i++) {
    let pogoj = niz.length >= 3 && opcije[i].text.toLowerCase().includes(niz);
    opcije[i].style.backgroundColor = pogoj ? "linen" : "transparent";
    if (prvi && pogoj) {
      let zamik = (i == 0) ? 0 : (i == 1) ? -1 : -2;
      opcije[i + zamik].scrollIntoView();
      prvi = false;
    }
  }
});