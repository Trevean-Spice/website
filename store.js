/* ============================================================
   TREVEAN SPICE — Shared Commerce Layer
   Zero-build, framework-free. Included on every page via
   <script src="store.js" defer></script>.

   Provides:
     • TREVEAN.products      — single source of truth for catalog
     • Cart (localStorage)   — add / remove / qty / drawer UI
     • Shopify Storefront API scaffold — activates automatically
       when TREVEAN_CONFIG.shopifyDomain + storefrontToken are set;
       graceful waitlist fallback until then
     • Email capture ("The Spice Ledger")
     • Scroll-reveal utility (IntersectionObserver)
     • dataLayer analytics stub (matches blend.html convention)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- configuration ----------
     To go live with Shopify, fill these in (see docs/SHOPIFY-SETUP.md):
       window.TREVEAN_CONFIG = {
         shopifyDomain: 'your-store.myshopify.com',
         storefrontToken: 'public-storefront-access-token',
         emailEndpoint: 'https://...'   // Sender.net / form endpoint
       };
  */
  const CONFIG = Object.assign(
    { shopifyDomain: '', storefrontToken: '', emailEndpoint: '' },
    window.TREVEAN_CONFIG || {}
  );
  const SHOPIFY_READY = !!(CONFIG.shopifyDomain && CONFIG.storefrontToken);

  /* ---------- catalog ----------
     Pricing source of truth: Spice Sage subscription $39/month or
     $99/quarter; individual jars $18. shopifyVariantId is filled in
     once products exist in Shopify admin.
  */
  const PRODUCTS = {
    'silk-road': {
      slug: 'silk-road', name: 'The Silk Road', price: 18, type: 'jar',
      accent: '#8B2635', img: 'data:image/webp;base64,UklGRn4wAABXRUJQVlA4IHIwAAAQfwGdASqEA9gBPnk8mEokpq0ro3IJkaAPCWdLrnl78fOt6F7C+xXz4pccKSNMXMX2Xhv+d/7Dpbf87wz+99MtllOtVKGO8+ryH8Vf+f4ftCaLfvGHF/25e9tz69P4xN/+QP+9PRr8v/0PFvXb5s/xO75t/0AL1p5VFFvkpG36Hk3tpwIgFu22HtDRBqNJQ7rJ2jg/wWDP+r6XfhZfH9OCFD+H1OmQfH+liPE8KSsCecuibP/a7DHSoYn22uL4Py9XEMON/OUDzYUt/M3x30LQoJwcWoXqDC9FiwpsgkkAvTuChTN1k2+q0CS/GSOq0p13PjG15zd/QtUjlDOaEgpatPb9/RZvUoKLBDKbwKMyqZiuMG3svRqkyZRjwDHmH70cirWNsQRuemHcYMY4JH+a6pNlaYayUOJTfap+13TZ2d/JJ6RQIQWooS5PBcke2M8VqmwOe9kUs7pWqnBkufFgoEjGWjpRSzgJDqSlHCwux+HMmgPLs8EXmQgmIvWE4s3gn9IrCnJbvoczdqqrnQO6oQmSKEQ67nLG1Qd2HyeJIfUxw9p75EPs2/iuJ6Mr8E93yfybLg5Gc0smzNG1/rGPGYrnrbstyzPvrGcgQ1Hyg5Hp9dBw4IKwmVuwWHhOPOge/RSkbHN3YlZl/Pbf+yOU9tJZ04M1j3bwqXQgQBUA/7MTSlxvXmOw+hQW4ojoQgA6auusC4YdHleoA+O9+ZULHReoIbi2QrFTjofUazqHZ8JH97/MgzdTDGgvMmyxfY8NtjIGXpsHRE9voCBhU+PZG5tTs+16TFSWRP0BYF3thz+SVQDO+hJgRcxjL4kmnLAdWa/ENFNU8dTgBE0Rpcqiy23ak6kl3/+he7DdZP+qpz13VcIU2K1EHhQfDFt+S+Bg+OUb0KWwZpo0iEZ42wQbeWWCrCCdBjB6V8xXCebDwRbf6traOPt50aMvE5ySAip6x+Ld4WrTYu6Gq1SSII88pIQnCDdnoIxyRI3sf80ERuzyhu/Xo+Jm3NBWTaeStS43egUByubY6hPZNDa7wIqdA2Awag1dq2chaX4AhIRfkoeEv90UByCT6COoRPwlCR+OJDNzTTKBIBrXjy9MttjMO1KGp8DnfL6IwOAQZL1DgxwwoAK+Ts5PoSQaqEPrfXHb4VRervp1MGe3WMEq/zkrB6r6btCMOwlt0cxcIORANKWKkcw5co0TMfkpX8hxWbExUVndHiFXzZxPEfzDl6ECKsJP4sTD3LABaqmK/DyAS3RjLYyaDcope2wghnY3PX9gbFJOkHrnnn/0UI+2E7BDeShJiqqNYkmPTPKDpphARHboWfNei9nToKJYEFOBH9vKxGVXTt6pj6gopOy/3HuvwmfTFDv+cabCypGwTsRnqhdxhABl4TMYQ7IwQPPIwEWQTnK5I5DOvTD5ZhrrdlwQDeDfxtlkSz4BgP5XJ/shvqn3L1eAe8te/R8MvhEOMU7WNBsFEb5SRcQbtUDwZuf1Ig+7QOPeZKDM4itJgHgslgXDmtsIJh0NpEtPXMheF0+hDzLmwnIoW+r/4IexyaZF0IvSTxp5/PJ86bwq/C793KJHCzihlzHgqiYO3eYmkT9uajs+zF+zF70DPLdayzY0Pmd0V2Uqw3ts6Zz7Kojxv80QtvaT7zkc1ZsTYkMRDOup5YgIHlFuXZGF+E7r0MgkD+u5s+DxgjiKTcVxtWKJ1US7BAj65Jzj1cHDEWnVDVfP1dgvThkFJC1ju2Bw60ljssrsidKMw4lUrOU/Jl1s93TUdI1PGhasxz3CQw4maCkwaTv9eN81TGHI/iCN25b0RbNnH1Z5wLWT/iSJf12iHQBmPJd3V1IyrzF2ANbHRF8e0lJe90BJcqZzxVwcWXwnGx/0gPjgzETB5dGPIWYfbyTGj20sZAcfw821b3QFbL4ggwnBxTiLl1YbfLpRvWoyvVNxa/ST8RNZuqc7YyMqUhiq0M3EX2NxMadIyViO3aQcnzLJ2I1ffKkYFMRASYDm4BJ+T2eA3u6a5jYTyM1swOjxeGNEv0Ci9qkZwEqzHkv/GS9kpfqX37VSUYZHUid2FWogzGuwg02GNaNu8QT59LAnpJjSPGTV7hPLHsQMsYmlML9aQ/TZ3aDj3Zi8tXrAuF4vpAO/AKn/hAejE3a5pZl1tUElFzaufLtbsoMWobMgZnwR3e31Bh0WsT6zXmBH2d4ZU6UOwKifZqtye6smK5R/gTA2lXKT0tdsj0MSOn2amrAG+t/d+aAtyzNOOeWbhPIndLs6iI35JoQY6nVNytDLQrntrEHN4kLOVw+sz/sdaZ8rxedQII2YIc/IykDoNum/3LHw2eeWGSTAcsQ2NxC3vBQFp6vqfcQRpLjOioQTRc+93c2FRMWIv9giTI1oRoH0wr3eEAcUrnVQJ2vAwpR55ScEycWMSzoLVDPRU/dLPJXGdduUgbJFU6+x4nvyLIMC6ZYSk1oabnjOoeXnrB1D0RCJDgd3C9i2duKEJuLxW7p86qPGeaPAEPLT1VQrgqGn35bJp9X3Ve7xet3UnRHb3UyUNuzR5DxyWyUoM28DH+Ma+kWLE6p0+5yBu65AIiqn5AJ6/vQmZdXrV1obB9BkAPU+eonukMMOjRKGwgfOBuKfKsZ6RLW4HLP3O/W0Db8MgPypXmzlhkGnTThIFNgNHg4xho+GufE9QE0WvlYaoIlQyclFSzuUqFxdhXkcu9TNCNVCbhm76yaTTfF89mtn6b2WOGda8iyPo6ArxmYEHSzQLO7YYb/CjanBeCBv4UXQyWdKaxWsLYXic5fVcvb1lDSSsQ0iOlBn7dF0XuDww7M8VAEpPglxaD9zP0KXGPaepJIb3sRwjGs7WUI3/6MHF8Y99tJdXEbCGYqTTijmvUbUT7SrnBAPU9rrhfK+EkiHr9IlLD+5DQNGdMpMhrAO9eqXj+5OweI2wn2CHsj5HCCx0zwptwWKWXv8COGkO7yOO7S0FxqRabDTDiq2tmYDsoqwS37H0+Aes98GGtQV3LCJdAXTeHn9kyAwhhVM9kl9eXFkUPIAXway8ePww3AjGnNra3eEZx/DS4SX+rjye1w5U+DnIGJJzhshVjcyvHl1fR4OSunpRCposmSHgSnRoiWKZGOruwgIaFEgxa4aODuFb4oks7+CEEqvdSpgJsIJi6J7InYqFvt5FtcEcnOYBpPCsgkBrCV9330NfkklCDT3xmEtUOPi/8hUPYemlDvIyc4sU843BWXJfG0kJG9nZbN/U+aJDAsTK1mfQNvw5ONaLRJf9vK8Csoq/dwmfnjS/Ivhe5OWUo1ARxRmYmUP4SP6NvwigkQhgstYESwkxtTOhvvvhiFyUG91DPUJVsNBnNg4wP17ia+HvDNhoQ9B/OVsF0JkzU2P12u2nqWRofmUACHgtK+i58cESuKr0+hXNh8VdsYBt0Ist8gjdY/lw9KinQ90ZXeMhxQAEUcVultWAeCk9980hG64UFB/8v21dvmPn/On/zu0E8CtObRSsaWMEL5eIt75bM8cut6ZAAbNLwpIZ9GnO04/KnodbRhuCE2xLIrJb+1R+cNqkk0u6q24r1fBH3Zdb7aJjagLiAwPnLoQGqghczCXogZPE336x+h0oip4IwC+BNgQvzojVcUfO70BKGWiRs3A+076agaV/w302eHVH+pc5i8vPTpPnT/2n0Ohyr98IOymcwMmxgjUh4Sh95hR0ivOexbThrUAX2LFLwwcMdwWpfRyGjc9389gtXDSruHmCIUf4jeTFQSbBkG8rhHoOXTeZvNLHDH27krvE8kSudvmnRMjkIUcEenjtyvQASfqiWo5/6qmJ+R1IAbzeiXUtQzQfq0lytucE6tVglWBHsL/oDskKhongO7zk6TjJakWsZgdijARo9RIzwCP/+qLWZDQVqvKiImyAKRkbRRYLKJY1Zy+gO/09+3Pspa21RB3oqNdwaC6lOqCRwte1Ab7xrG85OcjY8jYGhFcRXdXXBEp0isLh/BvwaTucJrkm5XvK8AzfCQEj19qu69VQ54TPoTR4xcU4CLvQZZMtULqW6xHIKqbGKrjbcEvaL96o6ygweDn1dxcoIdFNBLAMXHmWhQb1woAAP7fK9PulaHe40HFSs8LiHx1dcZ/VGFlnPTmHcxIrN5o0IY/8/9vkro1uU8gm/PNhIfM+9enQkI850hqVkzAoM9V9IiDUYbBTmuTayLxzF4SGuDIy4WsXxG6oUhlpuD9JX0LSSH7mh4zadhSJHALynNdpJWejZTmNcjojIR3LtBhsl0coy5r5B/8rc5WPvflzDTpzXkbFOZ7Bxkn3j1P5EvmyIdIu+Sp67PFqA6fIYkgoJurCClBhXHl+ahsJ3Z0eqXC3FicQ605NrPOdi1FneH642KZBvQbFLJ5saZuwfnxxrw7kMulI4UC2zPsIU14kC4D+GbK9jDVA89iGgi5MqS1gL/j+/tzs44sJFLuHXOmGXppWbsvBK5ObjqYmSnnWnIYD5Y5xUXtbH+dnYeF7pf/fCWT9pRmjANgL9RtTVsfE+t8P5LK6jEkrLE68ZP7Or2Sdwv8ZWc618gVy/Atmo6rUh/5Efmz0ZLGv6r5bJ8RQZyRHqH8RHGSjeln5srWUKIYQAg9f37PZU+jNNcTOAZv3ercZpYAUjCnJMZdZVBaTSlZF/528mVhweojf2Ncu3Xj4nIzL7Ut9nqZnJ4HnRtzqZDcs4WkKa9oC3NLZn+NZR5fv2W3FZvx5XZthwp5tRGZB0/ZtZGtw5zMn1xqZfwhY1G0f5Jqyu67SDZyqL5bbH/Yz9tLlyQXpy9sfXiIph3TKfpAD+U060rBgobzxhPSp8/TTnJo/2B4Ckks8sGYtj4ytRl1GzStliIWfjfVyGosYOAEP0C0oD4pgS2MPouSuKE95/C8kp8KNOCCkMYsIG5kzHjHWhzjZNOHTFhWZKFOHJI+PespXlQZKJTgy7brFE94ITZa75rWacFVvXRgMb0J1SI/VMGARli25Hba6JTnT7oiEOVKrEgcDtSm3AoBI6q3hT+9ug3OhbXGQa71Ar7BXXbHIKvIOhlGWHX4f9+bHdTT7eDc9IboQ2DwSZshoQyLyqlkr9I0m7d9cClcs62pzCJNXpsA/4mMQhlWSRVoM09LfaTsjIb7jqhX9UbWwbxGx9/+or06tTZz9FA9y0FMNt8acAPEO50mzxuoTHROzdZHjg2vouMN1uY8QDlq+nxxaLmwRKxc/1SVSYSCSLrb231lC3LtEwYStXzJqshbSVAXrztIfkyVKClOIolP2v+jlhx1Y5CrEUiSuq8wKQGPNDf9ysvnJ7yLTHNxt+hYgJ0bPxTBg5kjdt9DmrVaufhesOvRPY6AqtWb8+SV+D8iUremYwDXgkxzUNZi2JGV8XNA70IQs8XRa0g7iEv76RZXWffcz6QfLa+I1V1JTliso0PEqpjp98y9RxkgEKz8aDvs4l1NTQeaqySqHY+Qvjb+Nv7ja5KmfDa097A95YqsH3e4YnKIFCUSQPdVZIHd8Qjm0X3RegjtLSprY82KEfc9BRlYpMZhTFU7HJ6020kuOR99VrqGhA6CozsFF+5alltcUU9FTO+SLg5Ysj08WRmRHDEAcbP+vcKLbLJ4adiBhgEntkplJzbNrbq+stH2Wm9aG0eS+LDByg1mCksQodpiLD7rdeePJqZvZL2D3W1UanaHA2JpIH0eGkIZUFRc7sy1YDktycFuarrJ83T3e2FKjMS00+4wmf5AiOt5WNBFXlz4mnc1AbXS+/4vPC5qTUmstNWbWRKY0EJDb8Kq0XUce2Ofj3ETGsvaGEc41LyDx960LB2LIu3bH/yFbWSx02X7S5RwsqVN6ng6GxhfAIzmGAM2JhgToT0PDHk90OKR7Zk4xqjGJO9jjZBQN+TqWuairae0N5rOfhx/0GZ71tWt93T/fjMd1fwvzo3IY0yvySHQWUR73s2Xnkmm/qLmnDjoI/T8E02JZD4aMzbF1k3Ohmaj2rf7fn9mV2eTH4bCYUpAx1crSHI05mspFGTQ2zwgj8V+EUIMPK490d0i9bVqi8G4VOgG6G0UGgZDJh96OsOaBawG3qYHqpqy2RuR2Ts6s1vFABZTqizJeMiVoR2ff5bqAbgoTb2hFhFUF9BBdrKM2SkTkUoVwPaZibjSVJFZhyRTutVmNZlPBdhG+6/AikNGrL0UtHC1YgRVsbLD2Wm8HIIO1GbzQis2Y7Yetwfdk9Bkmzdm711y57iMRVXoQ2JuL1Vi4GoXoB+oWK1JDIBVxSYYQSqq5NUc8GoeJZEY7jjjCDqlrmWPYTm4hYtOYNT0onELJrlXbVnGsTKS7bGfSMffuAO9RHwki/ve/I2hB8Yv/aiUiggxBBurXUHqTsqoaAlL46k52E02IV7cM77V+uNE/9QfIfmvsoDVI31lKQXKvaOxqEPD9eNuGoQXHaepllNtVxefAkNewak+7dNi4KCP4xY7nlmSmAbzyHoFapppK5OebrTLITcy636UGaaEvN/DFsEufC9F0XG8qga2Sc5RV/8ml9u0GlYq/AFwcqjHXkDH7Ex8CEnshOt+zNYOrQSb9Cz2iaaPvgB/jbm5QCto6Sa5g18RGwf+FpA0iNGrb1XOE2MFF8ob5tJdOm+HaxMiLLXvHsHHuXbW68+Yo36ShVPQfCBtRxRzsSFl16W33kncuD4xcz4BvIDvS5JgfwsVW0vVelHYNCtpvGcR5dioEJO7ywRgwIs0ZCw2BShut8O0rVWTKjxi/e5lz33hkA0NiC45OqIdVgycxtHiIIcFJufcw2hL+4hdVFBiB63/ZGq/g5x8kkzfYEM13YVYgUfTFODV2JEX8Rd8kGeds13aTiPMLR77tdoSFPBLjQ5+IVeQwFCIkQFW1BZI4GLx6dHuJRdqtbnZFoPXymOma2glI+Zc37XJl+bmztJSpv/KdLWyMgy0Q4DNqwpmOGlhIS8nZS65Bc8D+na7JhVNapENvftAUkTrDOWPec62BI35HlcCTBUt4np1F6l4jSoR1ncBTnQQZXiT71UwEdqmN7q2ItfWkW/YMEn4Pe+Vig0IN8pGuwbxjemp+jZVz5XPL60xkFaOgAr8yCg1S1dunzGckgaFbh4z/rz6cEbX4u7RSdyzIVUYOUVdqbjVg991ublRj8ufKmRZxiRJJV6tPQRE3n5y1wVxqezjJzXO4YCTS4rO6FidDU6++Oz6ePiHDkUS9sd4Do8Z0CRpztnxgqGfPMRgqMYCqxkSooCekN0eUzhOrvhy4uYsH2ug1UMT/KxPpeUnLqsveEWw65J6v0GVXQeWvIVCDptdGEtASrKoRgjUPnODOaUJua0IZiTCa2sw1XM6GyS1ttueyGoXJyD+5u/zKNog3glVYYJzdY9DlTrUVc6bjn/RiRZPoIhwEzmHQxpvXSzotr2lsHiAP0s9wKR0iU64xky3tMxDKw5fUfeaJ8z3J8j+aGnykZrSRTyUag7PDITZg7+eLhIp460ENhWXGC5Ae9zYzPSxsF4ZtwC1QSJHrVXjo9aVCPNZ69BLtLceXMUcwHv6TmFFr97CFbrIIL2Q/rnVxubradPYGV1qg2PTeZifzWEy7otcohRxQEO66mlfVzOEVFNmba7LZ5PIPUXy9QKGTkuvPunNigNlLaJ4d/O0s8BS1JYpyQHGmL5FihtlEyMtsfzpl0jDMk7exGGol3OY7IRu4pBULkSKRuLohVe+YyjAJkgPRBaJZoO64Ci8pXcaFCqKlwY8yhOAUIOu8DiYf8mr6vbTBfPTpbjm6IGoMX40d/tlAVfOFPU0bGPssYJDSEd4eTvXcwdEAB7JLjpuX2qJW2gOphbtICukevo3BsZLqRNgxCOIe7WRKLS/eg6qygFMws22d27sW4Or78TfVhj8Pf3ZRLWXKbBVC9bxUcbdckdnNPWRubhjArNA0bqbtID5LXZiERQFtm8Wk8LtSLpfOjNin0v8KkATdBPJQXGbE6ff9Tqhb4hSbBBfJSOad4P8CmQH8gB5+VYCYs9y4QN6BaLej8EiSW2Pn2HyIMPduesSuvXovhdSFIL6qwbz/vSiiLv9IS2EL3np0ziRfjAiEUQ5Tw0YSx5Zr8rgl+0xWoV+bQQ1b0ilig8Fqivwl3WCEyHYtH+XmwfcBgjKHLXdOoGUsvLVHdvz6yb9ITItLUW4B8zVQrjwOh45w3HtgEmHO3YZVuB2Nw6ZrEHmIeZuUWikACxiX2BMWQvX2LrMlJw7r8Gkhz6IMVcnGwg/DI9ADBSIw8ruNgIDQf3IC5TLA9rO/jE0eMah4evw8I7uIsGI3pC6ls/UzT9MtrPIUjnXCvK1p635KSdl4X8vCyhZOguQqddl3sUw9SOrD1xVK7cU4tCsb70LbtkXbDCWzFMo0LnOlRIw9viRUJ3Q7j0z5xrwxwR76wSjJ3x+pJNjiyWAwaOWP8lb4xltwLVl4am7cVUPWnI2cf7AGd1lm+CuJoENjwaBvyKwqUKXDZxxUw7wCylghEh9HVOrE7jlhcCg/eRlq5ann98JlxFfbRXsIEIki7G8VR5fOfCz2KLkHdPKC55T6Vj4kqs1Vl68grhU9C02ryK2whn9LLfllNwzkWxOSVmXN/41xUcrDxot94/dBFyUq0VxBotQSjrRaa1uqRrZ9r+lg0mFh++bLHp/yhNz6F/2wN1M05wYrxWYevycDgAjRPHQ1epuVf0TO+wME9Ym76F/oRo45iekMgxYmPJJ8+yinun56l2Uyi+OxkcAk0j9DG7gKVdUwHneAdcxgLa+hhJQd15/bXvvGBpow3StpniL4KOJ5IXu02S7h4BIzkPy2U4erNNcc8TPPGIzTwZ+Wl9aSqIDihVHR2/Yzqp7+9jVFAJzk/SwV8Wa5frIvckWp+1d9tteBqyXT+y2M4vHvKMLFxQ9lyjeHt9OgbcR9QE4ERItWcCW89ssh2eq0FumarpWwQJTMDmt1yTcpX9b1FtRutWH5WrwYnoCsxjb8wlK0jfQ0xgdq0mWFRm1hTeHfa9X5CtCII5O1NdDvo+LkEyuG1BAGx5AeaKv5at74p1bOEE7HF6K65qqoyXFts+Kr0hx9HfS5W+ztBOLRC5PC8gFWuoNXXgIezM3wuHFce73qDhdsA8O+l7TwgHl2Lg/SQnU2yYxIlBO/EfAMULD3ZI26z0C3g4N1ZNvE1/JyFvoQzXrpj4DsRYl2J3Mmp609b1tf5Mnq8qU3CrAISWUaUnmROji56ph3bZWcYLCPdTUQ/TKJ1pfw+D32P4AgGvIRZj7W0cUp+bGqbJqHO/qhtYjprJbHMPbrPKKQyQjJDgbKUgmgGrLAupY2W1IAtGp86K1T4fydmjk2waGRZkOBYH8N6mpMlyDGfCK/eJYLpsSw/eL26414gVjx7MbuFsU3K20fsDovpob8Frgvlk6SBBAVje2Kaj52jTfjGoCaajrgsEZcx7eZPqbtrG2xVTQ1PQwYWbZNHKDTGTBNUyt/YKpNiHHQ9heiucLo6D41OvRTTZGMb8CblrnmKCONgzsVhYFoShhDeMdr9Htrqa25hAFhTGIm5vzq5pSO+MdjQ1x+c+OZ3P7RlmDtgBGLZrbTJ+euzNgmvze3Xv3tP7j7OZHl8NqPMH6sBxztaZTIb5kGTxQgK/L3Pw0G5yM6AcrJqzpt+8LfLdljvDx0RVSoHP5Vut/IoRJRuLEC7Krbb70jcw9HoMpcYtGjqxZUTIoBuLF0IAa1xFt1HkbIwMJySL0bxvdzPXocNqizZYAeq0YETx73ikt3zOwIbiZKLpQi/2pBXdJwTYGLJG/ri01Wm8b17Tox8OIvJsFGX5K6AZfLvj8Nxfs/OdjoTKSDRf4baHYgmHKXsLh8cH8ZEBFiCixMIIE5VS3NdUmKBcC9msXATPk0SSPYpIYJxeMHQiQJzFYbEIA+oizMwfpaI9EnezCUqYvXzzeOD6sSdtlRcemW5v749SSVvvGOM2sKPkMV/NwXJQWMLSfGD9T8cuCMWz4LezSICIeT5p3nu74le6MQXPIOXl9C/+gYzgUnPQkM0GzJIA70X68Suh/41WTINvlG4CcLewBAIKujU/IKgxLKoCPzdK2m1Ny3LoC5XlGK/6CoELTf1qIAG2GjKqvXHZUduOzckWvOqmUHVLgl+dyNeHA3WHsyNuFewPv87aF0zbjFQut7QNZRD9MkvQJ2a2ijzwuzrEm2vsBiE4o7WKHdbnTCXLBIlDNvYGncU3/9lMuS4bvARQkMhlOiHfsZElDHsH3QgBINVnFW9CJv9X7ewPSChoI2Hs0ObYwcNmGb/Rb6hG/S8pxgcPeP9+ETSG2kSAZapMZ5RMFeS1XdaXwOey/QNc8SylMMtpwUr4SrTexeCuwa5xWHR6C909ClLCNUbIP3XV4/1XqTsNc8n8hHDhv8f2Z2OB7RZcFf10AwKhYOYq1HbJnR+eHhHe3g0pbmVg33kOM7CZ8hyCO2rRxAt4Ya4m8uH/hgzXbtUjdy0ldnCyJYLtabFRdPzkMODUnaxYvVokYz5ZtFILH5aB9BYgHaOUSk02wGVeBn5MtxX5114Hs9+s93jv/PrqfzvtSdJiuacycg+phsKiaKWiY850500RLHEPXuHsR/ATFXAJF2NxnT0ethAocIeyKT2Czb+2RclNElMizwqqOltiRfm2bOzLrSXmLfAGEJyvDzVbPGp7DRg3S4ac2ZyyIwgiK0PU3MGnJk3Ylu6MMYduyRUtorKO4r1eRf2fPg8dYIwEkmDbOnzdeNmfZh3BwvV006WA1K4XC716wXndhyExTveVYJ4iZcLPsD0oO6837tJxNHxsyK3iD7Vi72FWrF5V3LCBnhjV3rqN4FIudJBvLqNeY/QKKZiFfpaDlDdQRTj6HNACr9RnLenjL29EdTDu8BuYWuW188wqKHtuwk7FCxJoGrWL+yFycHn4XsJK8yGYZrlcgqAGMNh93gh/wAf9wFO8KDQ2n7Awg8VdcOOGTKE5Bq/w9Q3vtGm5Omayz8MxL0KUZoq2pJVrGjnn4SyJy7cINWRbBb3ZeCNnJZ6WudxGv8/eNgw+qiEY1Wg8MhhAgJbi9IT00EPo4sBqsxNgMKSpJdXA8MXPIkR4vIlXPdHlp5U5FjLLJQ/tNHz+jxT76iWURMe+V2tM61Fa7AvC4Lf08hxsykO8uAojGUlMyI1J4JGt9W5xeMYBFAl9S+WCLjx8bLpV5CoghYFhVpRMXPMJM5Y8s/r/QdvwoZeDeOonGUkM1G5L/bjT9/cNVrwy7Ga3THPoQFumFeIPgO5bpoRnST8WqBb0MXici0XYVjcxnD83VIJO7gKAQAeK6ouPxndV9KK8R9HRmf6lOcU85a6gI0OZf/Qnq/MhfuvSnngdlV8maZMXUIwvnXFYs0CnY7oZTOJilnHmWAoQuak2Q4Eldycq38HRXcVFg5shlLlHIcJJLdru1TngU7mpx5jY5kVyDYAyCi33/JrH9hVYWaL/0qEIYAj3gHVA4rIM8QWOuzCGhTp1N/ix/LtmiFxAi/Ii6v6FYLGooXpfM8ilYPujlp6L0A06IK8ecmj+h7CTG0yQi3MaXisLAcs3U1nTKEff5hEfwriTXroucKo2Xi3UuuX+chyPpIdW4OsLFcYthEOLA30BdJ0jmt/1LZHgiEavSAYogr42xqhLWWMpVGBAioTUpihDIbghBrn/+RruxD/USIa2xqyoOeTB6mwWH7uWxcKk+38SBd83Pd37+0kDsnSo1Y1Il6QesLr1s5VjfA4etY8ptd/U7fn5p9wGLIHOX8ryVXmBVY5cRG9DE6E/GkHC684xGuCfbB++RTgQkU2Bc6Tpi36dqV359HJT3rvNIvxm+BPjqxXBLFze1/12zrLe1Meum4cUEybG4qfvyEGyqy03y+QVBgnR4+Snaj3aNyFrnm7EPMl/fLPjgDg885PuzN1QwSmK1kgRjtuIEDsNrzA1P9Z3NO7jRMpMz/w2aGqh+NnhFNQwdbhqEnJuu5BU765ja1WntsdNAGm/x+bUjsYpx8NcAYZtUWrQkFIrXkvEvbm45RTdwxN71e/48JLD2fNs/zlR5Y3B3WRYATW7sLDvIx4JRzbpOauVTt9Im++E0Si5TEG7mIq/SOGBXoDPuXIxzr+AXGUYfeXf3jSp+U1ll7g0AQG7+Y7yTlFY7quMw3Rgo6l9eHLd/hcGwD2Ft9n3pXcKUXay01Em3feeDQ7pcCINiIi9cEHD3cVaimfMxBy0DQj2XbaA/wkrtdrDI9O1uYPNQybgWSJCmGB9SY2RwcCsOwjwyUAAOj5+yttOHPIhM3ntmLPkZTtEFhH+sa9ZOOCQ1mUTbKSfsFBQTnBysZM3mpryoJmMGLm2XLDkIlIuMqH4WJSyVD9S5BXKXQtNF34DX+lmReDxuniWVW7Snk423gIDzz2KrGcRdyCVWsVal2huqJon1shy8xtu8kNCVxKSQDNcFJG9CQ1dcmKSdIVRHFgyN0lMXCx5ZA/9LObzWMqH8Xoq04Cu0qgiUiqGO0DgpKWYeDwRWDjDW7Cghle3vC4Ay6Lmn0cecjQlerfKaa088kBRj8nbbjZQtcHr6q6TbJwEzVQ5Bk/CGxAGJr8aHaSx26PNq6NtCf4ZebWhlmJL8hTlNLAmV4uT4lBgRKwcak+kaWd+Gh0AO5673It7qaUez2Z1JC/tjIxrYcRtU64KRa09qoWbcSmcR7KgRHhA6v67hLTonWn3kj/XOnPAmPYEZ2ltBDmIWKUUnrkr2s7n/7jUuHNmzl/kK5QZljYOf6HSwnlak7u5o+thtM7DRxeFkUXX47ZLNVxOf80yq4gK0rCqzz4fdrViNr2wQezfjoHDo09RJodfmq6AqwbB8paIo6CRObBNMoZKdynqisbqkCKUQAAyiAAFZZeD1sykYTp+3amxUqdKCS3ZxgkqxxJKQYjIKjITTnD0TG6BexHbpyGFgk4WlyhOnQsFRCp0l/cztvQF26Slz/hxIAckveqH7KprCAIc6N5ykH6qD03wmAgpPRCVijZQf90vTKzkvyJKQVC6OmDw0T7RhizcXPCnHTlzaqzSKfPEwrOoiPZCKR5ONKUa8PJlcyysjwlMPXejCzY6Qi7OttVMWjp8tpLXHDX/w8+AfUA851NGyDxhzv0lAnlt16NCeitHW3gFtHswjbhH1mDxVSdrTtYDInv8CVs/T6CvQSywfMKMbClAN21pyzl/tDS918r9BKuByM/qbTWV3Nr+VY8Yqow3qekJco4SQz6nyOYJQ9/a4OJ0MiD8NN+/ff0XouFq3XVQU3UhnmDz4T0g26L1yI3jkM71YJk1LuLn4Ekzz50d/JogFXxIZqDStJs7cl9vIEYFAOwVqm6MQATjhEMA2/XnhnuN0pxTxpFBzxkACO0G8JnP2jrb19mx1T5/OwFircbSBzeaJW405HLwXF7zGgIaAnO1n5gFDehs2qIKUF2rt/fR4GxTbXjJBfE1i4lBjY2d53geAAX9TL0PqXqr51FRa6BTnwAG3QBkQAQnGtln+qcAszsumaaio20JoxsFamr6xjPYNkPjecuTg+UiDOxe3RIA5QhsI16lLik3td/Zcrobn9kICloezhDHJuUwSYUwXwQ5gai+3RqNo8exlaJvx7bDCUDTr4pV23OfeEpySZ7rmpucaeTMAkGuTmc0ZG4iJSJNNHpn6L6SWJGyfH5ytVhBrwBJgrXXyaQQvIFNyP6s/MJFR+TdxsD02yXxoSZKqzgH7RrmRIW1cOF9+oHvq0iPklvW8SmEyFRFO+QDNGoNH7wJ5KdEg3k9UdiFsyE61MFOlgMbAT6ZE+fDRoVjkHJ3QwhTFKmq3skRuHjvdKANWACUcMYnmgbyPhDvcMcWFVSO0Lq4B5fY81sZ2a6H7mc4324bzgVKW6VK9dQ+cjvMgwmEtJMwd05QhgRX7TZtgfX5NDEZHwA4cNUBLO37DUaAel4ltcxf8zCXwRzZuOO5XLUqMYehhAvvdyXYQc3K9rOR+ppg5kTgj4G0cMPXxG1RAOjiLUalp7S2CbokyZSip4HtQc1GjsO9FyI3q6vzxfvXCAjnIAiBywtMtpdZDmpQSAhA4D/kLIoQLVNiQNNsjdurE/8dpi9AIaMymZYORZUXVVvz4hDk1lX63Qm95ImQVitiHBQwUiIAV35h1Pono/I9CtWeLGFCkWOcW+ozQfeIQRb26WgKzIYASw7D54Uu7JR2snmi/RKmyuHdbfxxb8FeH/1ZbYJF/F+vWxI208rZyopP7t7oX18oOTLEPFkb40X581zgdADovWGjTEr7EYg3HMqwx/fjAiVH6HUWMOUdcM75qTuSsh6adQKpEiUsYUGXzA2DwumzEG1y+5LSu6N79s+jSgZ/awTorM0W+ed8WS/DWoM8/ZuM/AAJaOaCch2waUmS5Vhz0HD7XhgXbNljq/FeMAcUvJJQ2EtXw3fSEAzkF0+tNABqshUNE78ArWfk9WBEiEzygspFvxdVf4hRXoMYZdIFFPQhzfQddXWgsSgXNmf+tsCqkD0L+EYwHMHKZjomswR6TsmmxpIkokZYjiUG9zEZlF4xBpWI5Wz3tvfoITtJdeG6qZeUCfootSGR5GB167DZTk4//vYNH8xiCrE3cSzNtmv51Cp17aerRogb/9x6wIodcK1Aclco4gMtHeVz11BPzA2WyHrb6GgLzUCX+lMQoSFi80GUXrhJMD9CYEk1OA9ymg70OwABs0EFXkC729i36tvbi5CzgCFIkAvcpQEHAM8EcX7E6vNcdRX2W0eQKq5qRcRheZozC2EgeGRq8hLwILH05ABEMyOCuBBiEPYJzAAAAjMfKAABXMAUAzZhInGiRkDLABnQuGTjlooYYbri5K6CTGEdC8IPsvZ6gtM2z2EMpUzpAEESqsR2gObbN61ABbLLUgWVqD2oAAFrO4CxgBfgAAATbTWFxKbuGuJvyMW98P5Zrsg5sEgO5QjUcpJyU0O7HieWc6a+SEcgSLQ00Bj0DJAxAcFm+K1dA/8UmYGvy623P1FQNbcJ7LMBwt7P9GPCL4eJMN0NwUeQxoxuCulQJJRaWokRf0Rr/5pMdtL3CQnDTwfI5aleRDERO7PrnMfzlUg9mdSIH/SPGERKcxzT5gZvCLqhUlDhdxBZE1cFgRKtRp7FipKij3wijBQwADDjtldgFZ0kd3+AACRTYzCExT0ssAAYF+JgBF9SN8fG/MZH+gJaKd6yc0zQX5Ir1GYEgHWINsXlbzmsnC/9sYtJQRvhgkEiDTuEm2/ErQkeYsG9tV3tRVGr2S+kQUXs5GZSAZYcFQBVxoxLjdVj8S1Hlu661CEc3HubpD9GF2NGzylYetzXV8WP0QC+SQuuwIXcjVr1OX/1oRqudNiFFUTcWafYK1xNQtddavBR/JBsSwGOBeaWQ04yL6CpVD6T83nBDR+9XcspHxEvyy9SGaRrHeWggbMLexHp3rOl+6cBX+Bnv4ZmCr1lvNpygL3spmIoBd/ZnCwAD6y3otyXXfOAaYSvlne4EdgzHgZV5eM/WgMqvjZ7baUsAyutqoptxnEuv/9WInwWwz/idJR6s/ujfY+botb9f0AJx2r30CNvmg1elie3MlOPbmIu0ta9xIjQnEId2n6ALI7+1l5W+qZJqAeXyKfDGnX2oCM7nelTKCHCBP3ceEoOmyCOJLQKKPKKuFDoMgAS9IGGGF1KOuF4kbnuHiihy8twzozDm184yMZ6vloNo6wAjlD4HqnIT3OAAG1YmPAOwn6L7mxqY/WB0xwwK4ycA0bCJY8S5Se/QFwQ7bM7mFIWqxCKgOEGXrY8YLwYkTfngBazmy3izcBA52ogrc2gLHbOV3+HR189o11rPN7sBvCbmwcY4WhJrpmM+j0SvRc2KdDXclhkj/O9eK2hbQhkwm1vHvATkRLdJ4ytW1cj5Ao/vwRZyPJwKS5myyfgb7FYo7Qq3YjYRpahHzUr5F0WNGNGPwK1LTdKRgQu2Tdz5gh/7SEBAKnMUzwgnOB3biKolFNChMiLbufmav8ZoHLqgGUffNUgWutQFQLoglqoiibIH+KuaYlgphfSdmYUHSMOKNZ9JNVpl3/7QgCRLrM7u1KUc61whF/+ytCZ8XwyQ+aW9+XJsiem0VsJIzYJledH1XldfLdUunJjQG2pZ553eIsoTjpgX1V6DRmyIjmzKQUEX0oM6QTu6s9VmVnNKoDiKcRDiy/JBPYQuGe3drjQJhuQfAg45xexmianQSTuiTVutGY8GggOs4X+qqazun9NgNm0lW1933eAWmv0lgfvY2JtlZ/Zn7J3H1R5MM1S+CiX5/30+CPW+s7chedsF2oTE3dBg8J2Wr6DMrv327EgX2NTSfLD3rMsd3gyhE/BvslBA367inue2/p1vKjHVRLuRwb4Ot8GqRyY4XO4YjFoYBn7YQrH660KWlqJpUY7jX061NReei/OqVDp2kC1OCwh/gtdxe14bqTnoF7+qnp8GlQYsoAVOV6/KrrYUGXaWB18+z1LV+RhKq48X5dtQiVR8kHWhI7js2w2yZPPCLHfA0YrLZHYwt3hlcS0Z+eeKcTUAAAA=',
      notes: 'Numbing · Warm · Complex', shopifyVariantId: ''
    },
    'kyoto-garden': {
      slug: 'kyoto-garden', name: 'Kyoto Garden', price: 18, type: 'jar',
      accent: '#6B8F71', img: 'pomelli-image%20(2).png',
      notes: 'Bright · Subtle · Umami', shopifyVariantId: ''
    },
    'persian-sunrise': {
      slug: 'persian-sunrise', name: 'Persian Sunrise', price: 18, type: 'jar',
      accent: '#9B7B6B', img: 'Saffron_and_Damask_Rose_version_1.png',
      notes: 'Floral · Citrus · Warm', shopifyVariantId: ''
    },
    'north-african-night-market': {
      slug: 'north-african-night-market', name: 'North African Night Market', price: 18, type: 'jar',
      accent: '#C4973B', img: 'pomelli-image.png',
      notes: 'Smoky · Tangy · Bright', shopifyVariantId: ''
    },
    'caribbean-sunset': {
      slug: 'caribbean-sunset', name: 'Caribbean Sunset', price: 18, type: 'jar',
      accent: '#7B3F5E', img: 'pomelli_image%20(3).png',
      notes: 'Warm · Tropical · Island Heat', shopifyVariantId: ''
    },
    'spice-sage-monthly': {
      slug: 'spice-sage-monthly', name: 'Spice Sage — Monthly', price: 39, type: 'subscription',
      cadence: '/month', accent: '#C4973B', img: 'pomelli-image.png',
      notes: 'Curated blends · NFC freshness · Recipe pairings', shopifyVariantId: ''
    },
    'spice-sage-quarterly': {
      slug: 'spice-sage-quarterly', name: 'Spice Sage — Quarterly', price: 99, type: 'subscription',
      cadence: '/quarter', accent: '#8B2635', img: 'pomelli-image.png',
      notes: 'Best value · Full collection cadence', shopifyVariantId: ''
    }
  };

  /* ---------- analytics stub ---------- */
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event, ts: new Date().toISOString() }, data || {}));
  }

  /* ---------- cart state ---------- */
  const CART_KEY = 'trevean_cart_v1';
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch { return {}; }
  }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  let cart = loadCart();

  function cartCount() { return Object.values(cart).reduce((n, q) => n + q, 0); }
  function cartTotal() {
    return Object.entries(cart).reduce((sum, [slug, qty]) => {
      const p = PRODUCTS[slug]; return p ? sum + p.price * qty : sum;
    }, 0);
  }

  function addToCart(slug, qty) {
    if (!PRODUCTS[slug]) return;
    // subscriptions: one per cart, choosing one replaces the other
    if (PRODUCTS[slug].type === 'subscription') {
      Object.keys(cart).forEach(k => { if (PRODUCTS[k] && PRODUCTS[k].type === 'subscription') delete cart[k]; });
      cart[slug] = 1;
    } else {
      cart[slug] = (cart[slug] || 0) + (qty || 1);
    }
    saveCart(cart);
    track('add_to_cart', { item: slug, qty: cart[slug] });
    renderCart();
    openDrawer();
  }

  function setQty(slug, qty) {
    if (qty <= 0) delete cart[slug]; else cart[slug] = qty;
    saveCart(cart); renderCart();
  }

  /* ---------- Shopify Storefront API scaffold ---------- */
  async function shopifyCheckout() {
    const lines = Object.entries(cart)
      .map(([slug, qty]) => ({ merchandiseId: PRODUCTS[slug].shopifyVariantId, quantity: qty }))
      .filter(l => l.merchandiseId);
    const query = `mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } }
    }`;
    const res = await fetch(`https://${CONFIG.shopifyDomain}/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': CONFIG.storefrontToken
      },
      body: JSON.stringify({ query, variables: { input: { lines } } })
    });
    const json = await res.json();
    const url = json && json.data && json.data.cartCreate && json.data.cartCreate.cart && json.data.cartCreate.cart.checkoutUrl;
    if (url) { track('begin_checkout', { value: cartTotal() }); window.location.href = url; }
    else throw new Error('Shopify cartCreate failed');
  }

  function checkout() {
    if (cartCount() === 0) return;
    if (SHOPIFY_READY) {
      shopifyCheckout().catch(() => showWaitlistNotice());
    } else {
      showWaitlistNotice();
    }
  }

  function showWaitlistNotice() {
    const el = document.getElementById('tv-cart-notice');
    if (el) {
      el.style.display = 'block';
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    track('checkout_waitlist_shown', { value: cartTotal() });
  }

  /* ---------- email capture ---------- */
  async function submitEmail(form) {
    const input = form.querySelector('input[type="email"]');
    const email = (input && input.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.classList.add('tv-shake'); setTimeout(() => form.classList.remove('tv-shake'), 500);
      return;
    }
    if (CONFIG.emailEndpoint) {
      try {
        await fetch(CONFIG.emailEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: location.pathname })
        });
      } catch { /* fall through to local capture so the visitor still gets a success state */ }
    }
    // local capture so no signup is lost pre-launch
    try {
      const list = JSON.parse(localStorage.getItem('trevean_ledger_signups') || '[]');
      list.push({ email, ts: new Date().toISOString(), page: location.pathname });
      localStorage.setItem('trevean_ledger_signups', JSON.stringify(list));
    } catch { /* noop */ }
    track('email_signup', { source: location.pathname });
    const success = form.querySelector('.tv-email-success');
    form.querySelectorAll('input, button').forEach(n => { n.style.display = 'none'; });
    if (success) success.style.display = 'block';
  }

  /* ---------- cart drawer UI ---------- */
  const STYLES = `
    .tv-cart-btn { position: relative; background: none; border: none; cursor: pointer; padding: 8px; display: inline-flex; align-items: center; }
    .tv-cart-btn svg { transition: transform .3s cubic-bezier(.22,1,.36,1); }
    .tv-cart-btn:hover svg { transform: translateY(-2px); }
    .tv-cart-count { position: absolute; top: 0; right: 0; min-width: 16px; height: 16px; border-radius: 8px;
      background: #8B2635; color: #F0E4D4; font: 600 10px/16px 'DM Sans', sans-serif; text-align: center; padding: 0 4px; }
    .tv-drawer-overlay { position: fixed; inset: 0; background: rgba(10,8,6,.6); backdrop-filter: blur(2px);
      opacity: 0; pointer-events: none; transition: opacity .35s ease; z-index: 90; }
    .tv-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 92vw); background: #241E19;
      border-left: 1px solid rgba(168,152,136,.12); z-index: 91; display: flex; flex-direction: column;
      transform: translateX(105%); transition: transform .45s cubic-bezier(.22,1,.36,1);
      box-shadow: -24px 0 64px rgba(0,0,0,.5); }
    .tv-drawer.open { transform: translateX(0); }
    .tv-drawer-overlay.open { opacity: 1; pointer-events: auto; }
    .tv-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px;
      border-bottom: 1px solid rgba(168,152,136,.1); }
    .tv-drawer-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #F0E4D4; }
    .tv-drawer-close { background: none; border: none; color: #A89888; cursor: pointer; font-size: 22px; line-height: 1; padding: 6px; }
    .tv-drawer-close:hover { color: #F0E4D4; }
    .tv-drawer-body { flex: 1; overflow-y: auto; padding: 20px 28px; }
    .tv-line { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(168,152,136,.08); }
    .tv-line-img { width: 56px; height: 56px; object-fit: cover; border-radius: 2px; opacity: .85; }
    .tv-line-name { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #F0E4D4; }
    .tv-line-notes { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #A89888; margin-top: 2px; }
    .tv-line-price { font-family: 'Playfair Display', serif; font-size: 15px; color: #C4973B; margin-left: auto; white-space: nowrap; }
    .tv-qty { display: inline-flex; align-items: center; gap: 10px; margin-top: 8px; }
    .tv-qty button { width: 22px; height: 22px; border: 1px solid rgba(168,152,136,.3); background: none; color: #F0E4D4;
      cursor: pointer; border-radius: 2px; font-size: 13px; line-height: 1; }
    .tv-qty button:hover { border-color: #C4973B; }
    .tv-qty span { font: 500 13px 'DM Sans', sans-serif; color: #F0E4D4; min-width: 16px; text-align: center; }
    .tv-drawer-empty { text-align: center; color: #A89888; font: 400 14px/1.7 'DM Sans', sans-serif; padding: 48px 12px; }
    .tv-drawer-foot { padding: 20px 28px 28px; border-top: 1px solid rgba(168,152,136,.1); }
    .tv-total-row { display: flex; justify-content: space-between; font-family: 'DM Sans', sans-serif; color: #F0E4D4;
      font-size: 14px; margin-bottom: 16px; }
    .tv-total-row strong { font-family: 'Playfair Display', serif; font-size: 20px; color: #C4973B; }
    .tv-checkout-btn { width: 100%; background: linear-gradient(135deg, #8B2635, #6B1E2A); color: #F0E4D4; border: none;
      padding: 15px 0; font: 500 13px 'DM Sans', sans-serif; letter-spacing: .08em; text-transform: uppercase; cursor: pointer;
      transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s cubic-bezier(.22,1,.36,1); }
    .tv-checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,38,53,.35); }
    .tv-checkout-btn:active { transform: translateY(0); }
    #tv-cart-notice { display: none; margin-top: 14px; padding: 14px 16px; border: 1px solid rgba(196,151,59,.3);
      background: rgba(196,151,59,.06); color: #F0E4D4; font: 400 12.5px/1.6 'DM Sans', sans-serif; border-radius: 2px; }
    #tv-cart-notice a { color: #C4973B; text-decoration: underline; }
    .tv-shake { animation: tvShake .4s ease; }
    @keyframes tvShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
    @media (prefers-reduced-motion: reduce) {
      .tv-drawer, .tv-drawer-overlay, .tv-cart-btn svg, .tv-checkout-btn { transition: none !important; }
    }
  `;

  function injectDrawer() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'tv-drawer-overlay';
    overlay.id = 'tv-drawer-overlay';
    overlay.addEventListener('click', closeDrawer);

    const drawer = document.createElement('aside');
    drawer.className = 'tv-drawer';
    drawer.id = 'tv-drawer';
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.innerHTML = `
      <div class="tv-drawer-head">
        <span class="tv-drawer-title">Your Collection</span>
        <button class="tv-drawer-close" aria-label="Close cart" onclick="TREVEAN.closeDrawer()">×</button>
      </div>
      <div class="tv-drawer-body" id="tv-drawer-body"></div>
      <div class="tv-drawer-foot">
        <div class="tv-total-row"><span>Subtotal</span><strong id="tv-cart-total">$0</strong></div>
        <button class="tv-checkout-btn" onclick="TREVEAN.checkout()">${SHOPIFY_READY ? 'Checkout' : 'Checkout'}</button>
        <div id="tv-cart-notice">
          Our Shopify storefront opens soon — Persian Sunrise and Caribbean Sunset are first off the line.
          <a href="#spice-ledger" onclick="TREVEAN.closeDrawer()">Join the Spice Ledger</a> and we'll hold your first-batch spot.
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // wire the nav cart button if a mount point exists
    document.querySelectorAll('[data-tv-cart-button]').forEach(mount => {
      mount.innerHTML = `
        <button class="tv-cart-btn" aria-label="Open cart" onclick="TREVEAN.openDrawer()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0E4D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 7h12l-1.2 12.2a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7z"/>
            <path d="M9 7V5.6A3 3 0 0 1 12 3a3 3 0 0 1 3 2.6V7"/>
          </svg>
          <span class="tv-cart-count" id="tv-cart-count" style="display:none;">0</span>
        </button>`;
    });

    renderCart();
  }

  function renderCart() {
    const body = document.getElementById('tv-drawer-body');
    const totalEl = document.getElementById('tv-cart-total');
    const countEl = document.getElementById('tv-cart-count');
    if (!body) return;

    const entries = Object.entries(cart).filter(([slug]) => PRODUCTS[slug]);
    if (entries.length === 0) {
      body.innerHTML = `<div class="tv-drawer-empty">Your collection is empty.<br>Five blends are waiting.</div>`;
    } else {
      body.innerHTML = entries.map(([slug, qty]) => {
        const p = PRODUCTS[slug];
        const sub = p.type === 'subscription';
        return `
        <div class="tv-line">
          <img class="tv-line-img" src="${p.img}" alt="" loading="lazy">
          <div>
            <div class="tv-line-name">${p.name}</div>
            <div class="tv-line-notes">${p.notes}</div>
            ${sub
              ? `<div class="tv-qty"><button aria-label="Remove" onclick="TREVEAN.setQty('${slug}',0)">×</button><span style="min-width:auto;font-size:11px;color:#A89888;">subscription</span></div>`
              : `<div class="tv-qty">
                   <button aria-label="Decrease" onclick="TREVEAN.setQty('${slug}',${qty - 1})">−</button>
                   <span>${qty}</span>
                   <button aria-label="Increase" onclick="TREVEAN.setQty('${slug}',${qty + 1})">+</button>
                 </div>`}
          </div>
          <div class="tv-line-price">$${p.price * qty}${sub ? `<span style="font-size:11px;color:#A89888;">${p.cadence}</span>` : ''}</div>
        </div>`;
      }).join('');
    }
    if (totalEl) totalEl.textContent = '$' + cartTotal();
    if (countEl) {
      const n = cartCount();
      countEl.textContent = n;
      countEl.style.display = n > 0 ? 'block' : 'none';
    }
  }

  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    document.getElementById('tv-drawer').classList.add('open');
    document.getElementById('tv-drawer-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    track('cart_open', { items: cartCount() });
  }
  function closeDrawer() {
    document.getElementById('tv-drawer').classList.remove('open');
    document.getElementById('tv-drawer-overlay').classList.remove('open');
    document.body.style.overflow = '';
    const notice = document.getElementById('tv-cart-notice');
    if (notice) notice.style.display = 'none';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------- scroll reveal ---------- */
  function initReveals() {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- boot ---------- */
  function init() {
    injectDrawer();
    initReveals();
    document.querySelectorAll('form[data-tv-email]').forEach(form => {
      form.addEventListener('submit', e => { e.preventDefault(); submitEmail(form); });
    });
    document.querySelectorAll('[data-tv-add]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.getAttribute('data-tv-add')));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ---------- public API ---------- */
  window.TREVEAN = {
    products: PRODUCTS, config: CONFIG,
    addToCart, setQty, checkout, openDrawer, closeDrawer, track,
    shopifyReady: SHOPIFY_READY
  };
})();
