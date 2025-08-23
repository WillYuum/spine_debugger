import { LifeCycleStateHandlers } from "../LifeCycle";



class AnimationList implements LifeCycleStateHandlers {



    private populateAnimationsList(animNames: string[], onClick: (animName: string) => void) {
        const list = document.getElementById('animations-list')!;
        animNames.forEach((animName) => {
            const listItem = document.createElement('li');
            listItem.textContent = animName;
            listItem.addEventListener('click', () => onClick(animName));
            list.appendChild(listItem);
        });
    }


    async HandleInitUI() {

    }

    async HandleEmptyDisplay(): Promise<void> {

    }

    async HandleLoadSpine(): Promise<void> {

        const animNames = ['test_anim_1', 'test_anim_2'];

        this.populateAnimationsList(animNames, (animName) => {

        });
    }

    async HandleActiveDisplay(): Promise<void> {

    }

    async HandleReplaceSpine(): Promise<void> {

    }

    async HandleClearSpine(): Promise<void> {

    }
}