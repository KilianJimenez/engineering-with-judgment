# Firmas

Cada persona que se adhiere al manifiesto añade un fichero `signatures/<usuario-de-github>.yml`:

```yaml
github: octocat              # obligatorio, igual a tu usuario y al nombre del fichero
nombre: Mona Lisa Octocat    # opcional, máx. 80 caracteres
rol: QA Engineer @ Acme      # opcional, rol / empresa, máx. 100 caracteres
fecha: 2026-11-25            # opcional, AAAA-MM-DD
```

Si un valor contiene `:` o `#`, escríbelo entre comillas dobles. No se admiten HTML ni URLs.

## Firmar a mano

1. Abre <https://github.com/KilianJimenez/engineering-with-judgment/new/main/signatures?filename=TU-USUARIO.yml> (GitHub crea un fork si no tienes permisos de escritura).
2. Rellena el fichero con el formato anterior y pulsa **Propose changes** → **Create pull request**.
3. La Action `Firma` valida el PR (un único fichero nuevo, a tu nombre, con campos válidos) y lo mergea. La web se vuelve a publicar con tu firma.

Si la validación falla, la Action comenta el motivo en el PR. Puedes corregirlo con un nuevo commit.
