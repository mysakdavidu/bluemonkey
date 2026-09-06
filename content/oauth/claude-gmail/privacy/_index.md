+++
title = "Zásady ochrany soukromí – Claude Gmail Personal"
description = "Jak nástroj Claude Gmail Personal nakládá s daty z účtu Gmail."
template = "section.html"
+++

Tyto zásady se vztahují na soukromý nástroj **Claude Gmail Personal**, který
vlastník tohoto webu používá k práci s vlastní schránkou Gmail přes asistenta
Claude a rozhraní MCP. Popis nástroje je na stránce
[Claude Gmail Personal](/oauth/claude-gmail/).

## Přístup k účtu

- Přístup k účtu Gmail probíhá **výhradně po udělení souhlasu přes Google OAuth**.
  Bez tohoto souhlasu nástroj k žádným datům nepřistupuje.
- Nástroj používá pouze ta oprávnění (scopes), která uživatel při souhlasu odsouhlasí.

## Použití dat

- Data z účtu (zprávy, vlákna, štítky, kontakty v hlavičkách) se používají **pouze
  k provedení operací, které si uživatel sám vyžádá** – například vyhledání či přečtení
  zprávy, úprava štítků nebo příprava a odeslání e-mailu.
- Data **nejsou prodávána**, předávána třetím stranám ani **využívána k reklamě**,
  profilování či jiným účelům nesouvisejícím s požadovanou operací.
- Nástroj neprovozuje žádnou centrální databázi uživatelů; přístupové tokeny jsou
  uloženy jen lokálně u vlastníka nástroje.

## Odvolání přístupu

Přístup lze kdykoli odvolat ve správě propojených aplikací účtu Google na adrese
[https://myaccount.google.com/connections](https://myaccount.google.com/connections).
Po odvolání nástroj ztrácí veškerý přístup k účtu.

## Kontakt

Dotazy k ochraně soukromí: [info@bluemonkey.cz](mailto:info@bluemonkey.cz).

[Zpět na popis nástroje](/oauth/claude-gmail/) · [Hlavní stránka](/)
