# Revisión del banco con el Cambridge Dictionary (UK)

Generado con `node tools/cambridge.mjs` (datos en `banco/cambridge.json`). Propuesta de cambios en `banco/revision-cambridge.json`; **sin aplicar**.

## Resultado

- **words.json (123):** todas coinciden con Cambridge (119 en la forma principal, 4 en una variante). Sin cambios.
- **Banco (2000):** 1830 coinciden, 20 coinciden con una variante, 132 distintas, 18 sin entrada (comparativos e irregulares, revisadas a mano: correctas salvo easier y understood).

## Correcciones y cambios de forma principal (35)

| Palabra | Antes | Después | Variantes | Motivo |
|---|---|---|---|---|
| storage | /ˈstɒrɪdʒ/ | /ˈstɔː.rɪdʒ/ |  | error: la vocal es /ɔː/, no /ɒ/ |
| sample | /ˈsæmpəl/ | /ˈsɑːm.pəl/ |  | error: /æ/ es norteña o americana; en RP es /ɑː/ |
| infrastructure | /ˌɪnfrəˈstrʌktʃə/ | /ˈɪn.frəˌstrʌk.tʃə/ |  | error de acento: el primario va en la primera sílaba |
| supreme | /ˌsəˈpriːm/ | /suːˈpriːm/ | /sjuːˈpriːm/ · /sʊˈpriːm/ | error: marca de acento sobre una schwa |
| spiritual | /ˈspɪrɪtʃjuəl/ | /ˈspɪr.ɪ.tʃu.əl/ | /ˈspɪr.ɪ.tju.əl/ | error: secuencia /tʃj/ imposible |
| easier | /ˈiːziːə/ | /ˈiː.zi.ə/ |  | error: la i débil de happy, no /iː/ |
| located | /ˈləʊˌkeɪtɪd/ | /ləʊˈkeɪ.tɪd/ | /ˈləʊˌkeɪtɪd/ | acento británico en la segunda; el de la primera es americano |
| somewhat | /ˌsʌmˈwɒt/ | /ˈsʌm.wɒt/ | /ˌsʌmˈwɒt/ | el EPD y Cambridge acentúan la primera |
| alongside | /əˈlɒŋˌsaɪd/ | /əˌlɒŋˈsaɪd/ | /əˈlɒŋˌsaɪd/ | el primario va en side |
| magazine | /ˈmæɡəˌziːn/ | /ˌmæɡ.əˈziːn/ | /ˈmæɡ.ə.ziːn/ | en RP el primario va en la última |
| understood | /ʌndəˈstʊd/ | /ˌʌn.dəˈstʊd/ |  | faltaba el acento secundario |
| individual | /ɪndɪˈvɪdjuəl/ | /ˌɪn.dɪˈvɪdʒ.u.əl/ | /ˌɪn.dɪˈvɪd.ju.əl/ | faltaba el secundario; se añade /dʒ/ |
| individuals | /ˌɪndɪˈvɪdjuəlz/ | /ˌɪn.dɪˈvɪdʒ.u.əlz/ | /ˌɪn.dɪˈvɪd.ju.əlz/ | se añade /dʒ/ y /u/ débil |
| species | /ˈspiːʃiz/ | /ˈspiː.ʃiːz/ | /ˈspiːʃiz/ · /ˈspiː.siːz/ | Cambridge y EPD dan /iːz/ |
| employee | /emˈplɔɪi/ | /ɪmˈplɔɪ.iː/ | /emˈplɔɪi/ · /ɪmˈplɔɪi/ · /ˌem.plɔɪˈiː/ | la vocal final es larga /iː/ |
| employees | /emˈplɔɪiz/ | /ɪmˈplɔɪ.iːz/ | /emˈplɔɪiz/ · /ɪmˈplɔɪiz/ · /ˌem.plɔɪˈiːz/ | la vocal final es larga /iː/ |
| created | /kriːˈeɪt.ɪd/ | /kriˈeɪ.tɪd/ | /kriːˈeɪt.ɪd/ | cre- con /i/ débil (convención EPD) |
| creating | /kriːˈeɪtɪŋ/ | /kriˈeɪ.tɪŋ/ | /kriːˈeɪtɪŋ/ | cre- con /i/ débil |
| creative | /kriːˈeɪtɪv/ | /kriˈeɪ.tɪv/ | /kriːˈeɪtɪv/ | cre- con /i/ débil |
| creation | /kriːˈeɪʃən/ | /kriˈeɪ.ʃən/ | /kriːˈeɪʃən/ | cre- con /i/ débil |
| junior | /ˈdʒuːnjə/ | /ˈdʒuː.ni.ə/ | /ˈdʒuːnjə/ | EPD y Cambridge dan /ni.ə/; /njə/ queda como variante |
| senior | /ˈsiːnjə/ | /ˈsiː.ni.ə/ | /ˈsiːnjə/ | EPD y Cambridge dan /ni.ə/; /njə/ queda como variante |
| entitled | /enˈtaɪtəld/ | /ɪnˈtaɪ.təld/ | /enˈtaɪtəld/ | prefijo en- con /ɪ/ |
| transportation | /ˌtrænspəˈteɪʃən/ | /ˌtræn.spɔːˈteɪ.ʃən/ | /ˌtrænspəˈteɪʃən/ | EPD y Cambridge dan /spɔː/ |
| data | /ˈdɑːtə/ | /ˈdeɪ.tə/ | /ˈdɑːtə/ | en RP la forma habitual es /ˈdeɪtə/ |
| won | /ˈwɒn/ | /ˈwʌn/ |  | error: past de win es /wʌn/; /wɒn/ es la moneda coreana |
| lawyer | /ˈlɔːjə/ | /ˈlɔɪ.ə/ | /ˈlɔːjə/ | forma principal según EPD y Cambridge |
| lawyers | /ˈlɔːjəz/ | /ˈlɔɪ.əz/ | /ˈlɔːjəz/ | forma principal según EPD y Cambridge |
| enjoyed | /enˈdʒɔɪd/ | /ɪnˈdʒɔɪd/ | /enˈdʒɔɪd/ | prefijo en- con /ɪ/ como principal |
| enjoying | /enˈdʒɔɪ.ɪŋ/ | /ɪnˈdʒɔɪ.ɪŋ/ | /enˈdʒɔɪ.ɪŋ/ | prefijo en- con /ɪ/ como principal |
| concert | /kənˈsɜːt/ | /ˈkɒn.sət/ |  | el sustantivo; /kənˈsɜːt/ es el verbo, muy raro |
| existence | /eɡˈzɪstəns/ | /ɪɡˈzɪs.təns/ | /eɡˈzɪstəns/ | prefijo ex- con /ɪ/ como principal |
| worldwide | /ˈwɜːldˌwaɪd/ | /ˌwɜːldˈwaɪd/ | /ˈwɜːldˌwaɪd/ | primario en wide |
| concrete | /kəŋˈkriːt/ | /ˈkɒŋ.kriːt/ | /kəŋˈkriːt/ | el sustantivo y adjetivo se acentúan en la primera |
| length | /ˈleŋkθ/ | /ˈleŋθ/ | /ˈleŋkθ/ | /ˈleŋθ/ como principal; /ŋkθ/ queda como variante |

## Variantes añadidas (las dos formas son RP)

| Palabra | Principal | Se añade |
|---|---|---|
| education | /ˌed.jʊˈkeɪ.ʃən/ | /ˌedʒ.ʊˈkeɪ.ʃən/ |
| educational | /ˌed.jʊˈkeɪ.ʃə.nəl/ | /ˌedʒ.ʊˈkeɪ.ʃən.əl/ |
| income | /ˈɪnˌkʌm/ | /ˈɪŋ.kʌm/ |
| interested | /ˈɪnt.ə.rɪs.tɪd/ | /ˈɪn.tres.tɪd/ |
| interests | /ˈɪn.tə.rɪsts/ | /ˈɪn.trests/ · /ˈɪntrəsts/ |
| necessary | /ˈnesəsəri/ | /ˈnes.ə.ser.i/ |
| environment | /ɪnˈvaɪ.rən.mənt/ | /ɪnˈvaɪ.rə.mənt/ · /ɪnˈvaɪərənmənt/ |
| environmental | /ɪnˌvaɪ.rənˈmen.təl/ | /ɪnˌvaɪ.rəˈmen.təl/ · /ɪnˌvaɪərənˈmentəl/ |
| apparently | /əˈpeərəntli/ | /əˈpær.ənt.li/ |
| vehicle | /ˈviː.ɪ.kəl/ | /ˈvɪə.kəl/ · /ˈviːɪkl/ |
| vehicles | /ˈviː.ɪ.kl̩z/ | /ˈvɪə.kəlz/ · /ˈviːɪklz/ |
| alternative | /ɔːlˈtɜː.nə.tɪv/ | /ɒlˈtɜː.nə.tɪv/ |
| specifically | /spɪˈsɪf.ɪ.kli/ | /spəˈsɪf.ɪ.kəl.i/ |
| literature | /ˈlɪt.ə.rə.tʃə/ | /ˈlɪt.rə.tʃə/ |
| perfectly | /ˈpɜː.fɪkt.li/ | /ˈpɜː.fekt.li/ |
| assault | /əˈsɔːlt/ | /əˈsɒlt/ |
| electricity | /ɪˌlekˈtrɪsɪti/ | /ˌel.ɪkˈtrɪs.ə.ti/ |
| virus | /ˈvaɪ.rəs/ | /ˈvaɪə.rəs/ |

## Vocal débil /ɪ/ → /ə/ (91)

Cambridge usa /ə/ donde nuestras fuentes ponen /ɪ/ o /ʊ/ (-ity, -ible, -ate, -ness, /jʊ/ → /jə/). El EPD admite las dos; se mantiene la principal y se añade la de Cambridge como variante para no dar por mala una respuesta válida.

university /ˌjuː.nɪˈvɜː.sə.ti/ · possible /ˈpɒs.ə.bəl/ · community /kəˈmjuː.nə.ti/ · security /sɪˈkjʊə.rə.ti/ · July /dʒuˈlaɪ/ · policy /ˈpɒl.ə.si/ · quality /ˈkwɒl.ə.ti/ · popular /ˈpɒp.jə.lə/ · specific /spəˈsɪf.ɪk/ · population /ˌpɒp.jəˈleɪ.ʃən/ · positive /ˈpɒz.ə.tɪv/ · ability /əˈbɪl.ə.ti/ · definitely /ˈdef.ɪ.nət.li/ · particularly /pəˈtɪk.jə.lə.li/ · opportunity /ˌɒpəˈtjuːnəti/ · regular /ˈreɡ.jə.lə/ · secretary /ˈsek.rə.tər.i/ · anymore /ˌen.iˈmɔː/ · majority /məˈdʒɒr.ə.ti/ · activities /ækˈtɪv.ə.tiz/ · anyway /ˈen.i.weɪ/ · competition /ˌkɒm.pəˈtɪʃ.ən/ · easily /ˈiː.zəl.i/ · reality /riˈæl.ə.ti/ · characters /ˈkær.ək.təz/ · responsible /rɪˈspɒnsəbl/ · executive /ɪɡˈzek.jə.tɪv/ · activity /ækˈtɪv.ə.ti/ · everybody /ˈev.riˌbɒd.i/ · authority /ɔːˈθɒr.ə.ti/ · impossible /ɪmˈpɒs.ə.bəl/ · possibly /ˈpɒs.ə.bli/ · responsibility /rɪˌspɒnsəˈbɪləti/ · strategy /ˈstræt.ə.dʒi/ · medicine /ˈmed.sən/ · anywhere /ˈen.i.weə/ · capacity /kəˈpæs.ə.ti/ · communities /kəˈmjuː.nə.tiz/ · policies /ˈpɒl.ə.siz/ · purchase /ˈpɜː.tʃəs/ · terrible /ˈter.ə.bəl/ · everywhere /ˈev.ri.weə/ · facilities /fəˈsɪl.ə.tiz/ · holiday /ˈhɒl.ə.deɪ/ · identity /aɪˈden.tə.ti/ · argument /ˈɑːɡ.jə.mənt/ · corporate /ˈkɔː.pər.ət/ · documents /ˈdɒk.jə.ments/ · authorities /ɔːˈθɒr.ə.tiz/ · chicken /ˈtʃɪk.ɪn/ · incredible /ɪnˈkred.ə.bəl/ · unfortunately /ʌnˈfɔː.tʃən.ət.li/ · opportunities /ˌɒpəˈtjuːnətiz/ · relevant /ˈrel.ə.vənt/ · facility /fəˈsɪl.ə.ti/ · possibility /ˌpɒs.əˈbɪl.ə.ti/ · accurate /ˈæk.jə.rət/ · category /ˈkætəɡəri/ · ultimately /ˈʌl.tɪ.mət.li/ · anybody /ˈen.iˌbɒd.i/ · manufacturing /ˌmæn.jəˈfæk.tʃə.rɪŋ/ · severe /sɪˈvɪə/ · deputy /ˈdep.jə.ti/ · personality /ˌpɜː.sənˈæl.ə.ti/ · ultimate /ˈʌl.tɪ.mət/ · principal /ˈprɪn.sə.pəl/ · regularly /ˈreɡ.jə.lə.li/ · valuable /ˈvæljuəbl/ · document /ˈdɒk.jə.ment/ · regulations /ˌreɡ.jəˈleɪ.ʃənz/ · cabinet /ˈkæb.ɪ.nət/ · necessarily /nes.əˈser.əl.i/ · primarily /praɪˈmer.əl.i/ · regardless /rɪˈɡɑːd.ləs/ · everyday /ˈev.ri.deɪ/ · purchased /ˈpɜː.tʃəst/ · reputation /ˌrep.jəˈteɪ.ʃən/ · ridiculous /rɪˈdɪk.jə.ləs/ · formula /ˈfɔː.mjə.lə/ · awareness /əˈweə.nəs/ · happiness /ˈhæp.i.nəs/ · horrible /ˈhɒr.ə.bəl/ · avenue /ˈæv.ə.njuː/ · ordinary /ˈɔː.dən.əri/ · principles /ˈprɪnsəplz/ · memorial /məˈmɔː.ri.əl/ · minority /maɪˈnɒr.ə.ti/ · priority /praɪˈɒr.ə.ti/ · visible /ˈvɪz.ə.bəl/ · incredibly /ɪnˈkred.ə.bli/ · regulation /ˌreɡ.jəˈleɪ.ʃən/
