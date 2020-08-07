module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>
            `;
        });

        return opciones.fn().html = html;
    },

    tipoContrato: (seleccionado, opciones) => {
        // opcines es todo aquello que esta dentro de las etiquetas 
        // {{#tipoContrato vacante.contrato}} y {{/tipoContrato}}
        // Fn() trae todos elementos que tenga esas etiquetas
        // bueno el resto busca el valor que tengas en la bd y lo marca como seleccionado 
        return opciones.fn(this).replace(new RegExp(`value="${seleccionado}"`), "$& selected='selected'")
    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);

        let html = '';
        if (categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class = "${categoria} alerta">  
                    ${error}
                </div>`;
            });
        }

        return alertas.fn().html = html;
    }

}