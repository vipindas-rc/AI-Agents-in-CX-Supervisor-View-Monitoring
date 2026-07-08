import { CircleCheckFilledSm } from '@ringcentral/spring-icon';
import { ListItem, ListItemText, Icon } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    REQUEUE_SKILL_SELECTOR,
    REQUEUE_SKILL_ITEM,
    REQUEUE_EMPTY_STATE,
    REQUEUE_CROSS_QUEUE_WARNING,
} from '../../../constants/testIds';
import type { SkillSelectorProps } from '../types';
import { EmptyContainer } from './Empty.styled';

export const SkillSelector = ({
    skills,
    selectedSkillId,
    onSelectSkill,
    searchQuery,
    isCrossQueueDisabledAndNoSkills,
}: SkillSelectorProps) => {
    const { t } = useTranslation();

    const filteredSkills = !searchQuery.trim()
        ? skills
        : skills.filter((s) =>
              s.skillName.toLowerCase().includes(searchQuery.toLowerCase())
          );

    if (skills.length === 0 && isCrossQueueDisabledAndNoSkills) {
        return (
            <EmptyContainer data-aid={REQUEUE_CROSS_QUEUE_WARNING}>
                {t('SOFTPHONE.REQUEUE.CROSS_QUEUE_DISABLED')}
            </EmptyContainer>
        );
    }

    if (filteredSkills.length === 0) {
        return (
            <EmptyContainer data-aid={REQUEUE_EMPTY_STATE}>
                {t('DIALPAD.NO_RECORDS_FOUND')}
            </EmptyContainer>
        );
    }

    return (
        <div
            role='list'
            aria-label={t('SOFTPHONE.REQUEUE.SELECT_SKILL')}
            data-aid={REQUEUE_SKILL_SELECTOR}
        >
            {filteredSkills.map((skill) => (
                <ListItem
                    key={skill.skillId}
                    clickable
                    hoverable
                    divider
                    onClick={() => onSelectSkill(skill)}
                    selected={selectedSkillId === skill.skillId}
                    size='small'
                    role='listitem'
                    data-aid={REQUEUE_SKILL_ITEM}
                    classes={{
                        content: 'flex flex-row p-4',
                        container: 'rounded-none',
                        selected: 'bg-primary-t10',
                        divider: 'm-0',
                        root: 'p-0',
                    }}
                    tabIndex={0}
                    className='sui-selected:bg-primary-t10'
                >
                    <ListItemText
                        variant='primary'
                        primary={skill.skillName}
                        classes={{
                            primaryText: 'text-sm font-normal text-neutral-f06',
                        }}
                    />
                    {selectedSkillId === skill.skillId && (
                        <Icon
                            symbol={CircleCheckFilledSm}
                            size='medium'
                            className='text-primary-b'
                        />
                    )}
                </ListItem>
            ))}
        </div>
    );
};
