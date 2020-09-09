import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recks } from '../../../src/index';
import { clickOn } from '../helpers';

describe('Props', () => {
    let rootElement: HTMLElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        document.body.appendChild(rootElement);
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
    });

    test('vDOM on root with props', () => {
        Recks.render(<div title="Hello">World</div>, rootElement);
        expect(rootElement.innerHTML).toBe('<div title="Hello">World</div>');
    });

    describe('vDOM', () => {
        describe('initial render', () => {
            let App$: Subject<any>;
            const App = () => App$;

            beforeEach(() => {
                if (App$) {
                    App$.complete();
                }
                App$ = new Subject();
            });

            test('Static props', () => {
                Recks.render(<App />, rootElement);
                App$.next(<div title="Yellow">Submarine</div>);
                const divElement = rootElement.children[0];
                expect(divElement.innerHTML).toBe('Submarine');
                expect(divElement.getAttribute('title')).toBe('Yellow');
                App$.next(<div alt="alt">Submarine</div>);
                expect(divElement.getAttribute('title')).toBe(null);
                expect(divElement.getAttribute('alt')).toBe('alt');
            });

            test('Output props as function', () => {
                const onClick = jest.fn();
                Recks.render(<App />, rootElement);
                App$.next(<button onClick={onClick}>Click me!</button>);

                clickOn(rootElement.children[0]);
                expect(onClick.mock.calls.length).toBe(1);

                clickOn(rootElement.children[0]);
                expect(onClick.mock.calls.length).toBe(2);

                App$.next(<button>Don't click me!</button>);
                clickOn(rootElement.children[0]);
                expect(onClick.mock.calls.length).toBe(2);
            });

            test('Output props as function: subsequent update', () => {
                const onClick = jest.fn();
                Recks.render(<App />, rootElement);
                App$.next(<button>Click me!</button>);

                clickOn(rootElement.children[0]);
                expect(onClick.mock.calls.length).toBe(0);

                App$.next(<button onClick={onClick}>Click me!</button>);

                clickOn(rootElement.children[0]);
                expect(onClick.mock.calls.length).toBe(1);
            });

            describe('Output props as Observable', () => {
                test('Basic case', () => {
                    const one = jest.fn();
                    const two = jest.fn();
                    const onClick$ = new Subject();

                    Recks.render(<App />, rootElement);
                    App$.next(<button onClick={onClick$}>Click me!</button>);

                    clickOn(rootElement.children[0]);

                    expect(one.mock.calls.length).toBe(0);
                    expect(two.mock.calls.length).toBe(0);

                    onClick$.next(one);
                    clickOn(rootElement.children[0]);

                    expect(one.mock.calls.length).toBe(1);
                    expect(two.mock.calls.length).toBe(0);

                    onClick$.next(two);
                    clickOn(rootElement.children[0]);
                    expect(one.mock.calls.length).toBe(1);
                    expect(two.mock.calls.length).toBe(1);
                });
            });
        });
    });

    describe('Subcomponents', () => {
        test('Static props', () => {
            const Child = (props$) =>
                props$.pipe(
                    map((props: any) => (
                        <div>
                            {props.title}:{typeof props.title}
                        </div>
                    )),
                );
            const App = () => <Child title="Morning" />;

            Recks.render(<App />, rootElement);
            expect(rootElement.children[0].innerHTML).toBe('Morning:string');
        });
    });
});
