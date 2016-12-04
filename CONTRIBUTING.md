<!-- markdownlint-disable line-length first-line-h1 -->

<!--lint disable list-item-content-indent-->

# Как внести свой вклад

1. **Fork**
2. **Clone**

        git clone https://github.com/<your-username>/Clean-Feed-for-VK.com.git
3. **Configure remotes**

        cd Clean-Feed-for-VK.com
        git remote add upstream https://github.com/EvgenyOrekhov/Clean-Feed-for-VK.com.git
4. **Branch**

        git checkout -b my-feature-branch -t origin/develop
5. **Commit**
6. **Rebase**

        git fetch upstream
        git rebase upstream/develop
7. **Push**

        git push origin my-feature-branch
8. **[Open a pull request](https://help.github.com/articles/using-pull-requests/ "Using pull requests · GitHub Help")**

## Качество и стиль кода

Не создавайте новых глобальных переменных.

Имена функций и методов должны начинаться с глагола: `function doSomething() {`.

Имена переменных не должны содержать глаголов: `var someVariable`.

Соблюдайте ограничение длины строки в 80 символов.

В конце каждого файла должна быть одна пустая строка.

Код и сообщения коммитов пишите по-английски.

### Создавая пулл-реквест, вы даёте согласие владельцам проекта лицензировать вашу работу на условиях [GNU AGPLv3](LICENSE)
